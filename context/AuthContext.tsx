'use client';

import { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createSiweMessage } from 'viem/siwe';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';

import { supabase } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/client';
import { IProfile } from '@/types';

type AuthStatus =
  | 'idle'
  | 'authenticating'
  | 'fetching_profile'
  | 'creating_profile'
  | 'authenticated'
  | 'error';

type ConnectSource = 'connectButton' | 'invalidAction' | 'pageLoad';

interface AuthState {
  status: AuthStatus;
  error: string | null;
  isPromptVisible: boolean;
  connectSource: ConnectSource;
  isCheckingInitialAuth: boolean;
}

interface UserState {
  session: Session | null;
  user: User | null;
  profile: IProfile | null;
  newUser: boolean;
}

interface SignatureData {
  message?: string;
  signature?: string;
}

interface IAuthContext {
  // State
  authStatus: AuthStatus;
  isCheckingInitialAuth: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  user: User | null;
  profile: IProfile | null;
  newUser: boolean; // Expose newUser flag
  isAuthPromptVisible: boolean;
  connectSource: ConnectSource;

  // Status Flags
  isAuthenticating: boolean;
  isLoggingIn: boolean;
  isFetchingProfile: boolean;
  isCreatingProfile: boolean;

  // Actions
  authenticate: () => Promise<void>;
  createProfile: (username: string, inviteCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  performFullLogoutAndReload: () => Promise<void>;
  showAuthPrompt: (source?: ConnectSource) => void;
  hideAuthPrompt: () => void;
  setConnectSource: (source: ConnectSource) => void;
  fetchUserProfile: () => Promise<IProfile | null>;
}

export const CreateProfileErrorPrefix = '[Create Profile Failed]';

const initialContext: IAuthContext = {
  authStatus: 'idle',
  isCheckingInitialAuth: true,
  isAuthenticated: false,
  authError: null,
  user: null,
  profile: null,
  newUser: false,

  isAuthPromptVisible: false,
  connectSource: 'pageLoad',

  isAuthenticating: false,
  isLoggingIn: false,
  isFetchingProfile: false,
  isCreatingProfile: false,

  authenticate: async () => {},
  logout: async () => {},
  performFullLogoutAndReload: async () => {},
  showAuthPrompt: () => {},
  hideAuthPrompt: () => {},
  setConnectSource: () => {},
  createProfile: async () => {},
  fetchUserProfile: async () => null,
};

const AuthContext = createContext<IAuthContext>(initialContext);

export const isUserDenied = (error: any) => {
  const errorMessageLower = error.message?.toLowerCase() || '';
  return (
    errorMessageLower.includes('user denied') ||
    errorMessageLower.includes('user rejected') ||
    errorMessageLower.includes('request rejected') ||
    errorMessageLower.includes('cancelled') ||
    errorMessageLower.includes('canceled') ||
    error.code === 4001
  );
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    status: 'idle',
    error: null,
    isPromptVisible: false,
    connectSource: 'pageLoad',
    isCheckingInitialAuth: true,
  });
  const [userState, setUserState] = useState<UserState>({
    session: null,
    user: null,
    profile: null,
    newUser: false,
  });
  const signatureDataRef = useRef<SignatureData>({});
  const prevIsConnectedRef = useRef<boolean | undefined>(undefined);

  const { address, isConnected, chain } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const generateNonceMutation = trpc.auth.generateNonce.useMutation();
  const verifyMutation = trpc.auth.verify.useMutation();
  const checkRegistrationQuery = trpc.auth.checkRegistration.useQuery(
    { address: address! },
    { enabled: !!address },
  );
  const getCurrentUserQuery = trpc.user.getCurrentUser.useQuery(
    undefined, // No input needed for protected procedure
    {
      enabled: false,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );

  const handleError = useCallback(
    (message: string, resetToIdle = false, throwError = true) => {
      setAuthState((prev) => ({
        ...prev,
        status: resetToIdle ? 'idle' : 'error',
        error: resetToIdle ? null : message,
      }));
      if (throwError) throw new Error(message);
      return null;
    },
    [],
  );

  const updateAuthState = useCallback(
    (status: AuthStatus, error: string | null = null) => {
      setAuthState((prev) => ({ ...prev, status, error }));
    },
    [],
  );

  const resetAuthState = useCallback(() => {
    setUserState({ session: null, user: null, profile: null, newUser: false });
    setAuthState((prev) => ({
      ...prev,
      status: 'idle',
      error: null,
      isPromptVisible: false,
    }));
  }, []);

  const logout = useCallback(async () => {
    updateAuthState('idle');
    await supabase.auth.signOut();
    resetAuthState();
    try {
      await disconnectAsync();
    } catch (error) {
      console.error('Error disconnecting wallet during logout:', error);
    }
  }, [resetAuthState, updateAuthState, disconnectAsync]);

  const performFullLogoutAndReload = useCallback(async () => {
    try {
      await disconnectAsync();
      await logout();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    } finally {
      window.location.reload();
    }
  }, [disconnectAsync, logout]);

  const fetchUserProfile = useCallback(async (): Promise<IProfile | null> => {
    const sessionData = await supabase.auth.getSession();
    const currentSupabaseUser = sessionData?.data?.session?.user;

    if (!currentSupabaseUser) {
      return handleError('Get profile failed, please try again.', false, false);
    }

    // Ensure local state matches Supabase session user
    if (!userState.user || userState.user.id !== currentSupabaseUser.id) {
      setUserState((prev) => ({ ...prev, user: currentSupabaseUser }));
    }

    updateAuthState('fetching_profile');

    try {
      const profileData = await getCurrentUserQuery.refetch();
      if (profileData.error) {
        throw profileData.error;
      }
      if (profileData.data) {
        setUserState((prev) => ({ ...prev, profile: profileData.data }));
        updateAuthState('authenticated');
        return profileData.data;
      } else {
        return handleError('Get profile failed, please try again.');
      }
    } catch (error: any) {
      return handleError(
        `Failed to fetch profile: ${error.message || 'Please try again later'}`,
      );
    }
  }, [
    getCurrentUserQuery,
    userState.user,
    authState.status,
    handleError,
    updateAuthState,
  ]);

  const handleSupabaseLogin = useCallback(
    async (token: string): Promise<void> => {
      updateAuthState('fetching_profile');
      try {
        const { data: sessionData, error: otpError } =
          await supabase.auth.verifyOtp({
            type: 'magiclink', // Type must match backend generation
            token_hash: token,
          });

        if (otpError) {
          handleError(
            otpError?.message || 'Login failed during verification.',
            false,
            true,
          );
        }
        if (!sessionData?.session || !sessionData?.user) {
          handleError('Login failed during verification.', false, true);
        }

        setUserState((prev) => ({
          ...prev,
          session: sessionData.session,
          user: sessionData.user,
        }));

        const profile = await fetchUserProfile();
        if (profile) {
          updateAuthState('authenticated');
          setUserState((prev) => ({ ...prev, newUser: false }));
        } else {
          handleError('Profile fetch failed after login.', false, true);
        }
      } catch (error: any) {
        handleError(error.message || 'Login failed.', false, true);
        await supabase.auth.signOut();
        resetAuthState();
      }
    },
    [updateAuthState, fetchUserProfile, resetAuthState, handleError],
  );

  const authenticate = useCallback(async () => {
    if (!address || !chain) {
      handleError('Wallet not connected, cannot authenticate.', false, false);
      return;
    }

    if (
      authState.status === 'authenticating' ||
      authState.status === 'fetching_profile' ||
      authState.status === 'authenticated'
    ) {
      return;
    }

    updateAuthState('authenticating');
    setUserState((prev) => ({ ...prev, newUser: false }));

    try {
      const [nonceResult, registrationResult] = await Promise.all([
        generateNonceMutation.mutateAsync({ address }),
        checkRegistrationQuery.refetch().then((res) => {
          if (res.error)
            throw new Error(
              `Failed to check registration: ${res.error.message}`,
            );
          return res.data;
        }),
      ]);

      const nonce = nonceResult?.nonce;
      const isRegistered = registrationResult?.registered;

      if (!nonce) {
        handleError('Failed to retrieve nonce from server.', false, true);
      }

      const message = createSiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to the Pensieve app',
        uri: window.location.origin,
        version: '1',
        chainId: chain.id,
        nonce: nonce,
      });

      updateAuthState('authenticating', 'Waiting for signature...');
      const signature = await signMessageAsync({ message });
      signatureDataRef.current = { message, signature };

      if (!isRegistered) {
        setUserState((prev) => ({ ...prev, newUser: true }));
        updateAuthState('authenticated');
        return;
      } else {
        const { token } = await verifyMutation.mutateAsync({
          address,
          signature,
          message,
        });

        await handleSupabaseLogin(token);
      }
    } catch (error: any) {
      const errorMessage =
        error.message || 'Authentication failed. Please try again.';
      if (isUserDenied(error)) {
        handleError('User denied signature or cancelled.', true, true);
      } else {
        handleError(errorMessage);
      }
    }
  }, [
    address,
    chain,
    authState.status,
    updateAuthState,
    generateNonceMutation,
    checkRegistrationQuery,
    signMessageAsync,
    verifyMutation,
    handleError,
    handleSupabaseLogin,
  ]);

  const createProfile = useCallback(
    async (username: string, inviteCode?: string) => {
      if (!address) {
        handleError(`${CreateProfileErrorPrefix} Failed to create profile.`);
        return;
      }

      updateAuthState('creating_profile');

      try {
        const verifyResult = await verifyMutation.mutateAsync({
          address,
          signature: signatureDataRef.current.signature!,
          message: signatureDataRef.current.message!,
          username,
          inviteCode,
        });

        await handleSupabaseLogin(verifyResult.token);
      } catch (error: any) {
        handleError(
          `${CreateProfileErrorPrefix}: ${error.message || 'Please try again'}`,
        );
      }
    },
    [
      address,
      authState.status,
      updateAuthState,
      verifyMutation,
      handleSupabaseLogin,
      handleError,
    ],
  );

  useEffect(() => {
    const checkInitialSession = async () => {
      setAuthState((prev) => ({ ...prev, isCheckingInitialAuth: true }));
      updateAuthState('authenticating');
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setUserState((prev) => ({ ...prev, session, user: session.user }));
          await fetchUserProfile();
        } else {
          resetAuthState();
        }
      } catch (error: any) {
        resetAuthState();
      } finally {
        setAuthState((prev) => ({ ...prev, isCheckingInitialAuth: false }));
      }
    };
    checkInitialSession();
  }, []);

  useEffect(() => {
    if (
      prevIsConnectedRef.current &&
      !isConnected &&
      authState.status === 'authenticated'
    ) {
      performFullLogoutAndReload();
    }
    prevIsConnectedRef.current = isConnected;
  }, [isConnected, authState.status, performFullLogoutAndReload]);

  const showAuthPrompt = useCallback(
    async (source: ConnectSource = 'connectButton') => {
      // 总是先断开钱包连接，确保用户可以重新选择钱包
      try {
        await disconnectAsync();
      } catch (error) {
        console.error(
          'Error disconnecting wallet before showing auth prompt:',
          error,
        );
      }

      if (authState.status === 'error') {
        resetAuthState();
      }

      setAuthState((prev) => ({
        ...prev,
        connectSource: source,
        isPromptVisible: true,
      }));
    },
    [disconnectAsync, resetAuthState, authState.status],
  );

  const hideAuthPrompt = useCallback(() => {
    setAuthState((prev) => ({ ...prev, isPromptVisible: false }));
    if (authState.status === 'error') {
      resetAuthState();
    }
  }, [authState.status, resetAuthState]);

  const setConnectSource = useCallback((source: ConnectSource) => {
    setAuthState((prev) => ({ ...prev, connectSource: source }));
  }, []);

  const contextValue: IAuthContext = {
    authStatus: authState.status,
    isCheckingInitialAuth: authState.isCheckingInitialAuth,
    isAuthenticated: authState.status === 'authenticated',
    authError: authState.error,
    user: userState.user,
    profile: userState.profile,
    newUser: userState.newUser,
    isAuthPromptVisible: authState.isPromptVisible,
    connectSource: authState.connectSource,
    isAuthenticating: authState.status === 'authenticating',
    isLoggingIn: authState.status === 'fetching_profile',
    isFetchingProfile: authState.status === 'fetching_profile',
    isCreatingProfile: authState.status === 'creating_profile',
    authenticate,
    createProfile,
    logout,
    performFullLogoutAndReload,
    showAuthPrompt,
    hideAuthPrompt,
    setConnectSource,
    fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
