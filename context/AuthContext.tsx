'use client';

import { addToast } from '@heroui/react'; // Assuming HeroUI toast is set up
import { User } from '@supabase/supabase-js'; // Correct Supabase User type
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

import { supabase } from '@/lib/supabase/client'; // Adjust path as needed
import { trpc } from '@/lib/trpc/client';
import { IProfile } from '@/types'; // Adjust path as needed

// Types similar to SupabaseContext in Zuzalu
type AuthStatus =
  | 'idle'
  | 'authenticating'
  | 'fetching_profile'
  | 'awaiting_username'
  | 'creating_profile'
  | 'authenticated'
  | 'error';

type ConnectSource = 'connectButton' | 'invalidAction' | 'pageLoad'; // Example sources

interface AuthState {
  status: AuthStatus;
  error: string | null;
  isPromptVisible: boolean;
  connectSource: ConnectSource;
  isCheckingInitialAuth: boolean;
}

interface UserState {
  session: any; // Replace 'any' with Supabase Session type if available
  user: User | null; // Supabase User type
  profile: IProfile | null; // Your Profile type
  newUser: boolean; // Flag specifically for the prompt flow
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
  isAuthenticating: boolean; // Covers 'authenticating' and 'verifying'
  isLoggingIn: boolean; // Covers 'logging_in'
  isCreatingProfile: boolean; // Covers 'creating_profile'

  // Actions
  authenticate: () => Promise<void>;
  createProfile: (username: string) => Promise<void>;
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
  isCreatingProfile: false,
  authenticate: async () => {},
  createProfile: async () => {},
  logout: async () => {},
  performFullLogoutAndReload: async () => {},
  showAuthPrompt: () => {},
  hideAuthPrompt: () => {},
  setConnectSource: () => {},
  fetchUserProfile: async () => null,
};

const AuthContext = createContext<IAuthContext>(initialContext);

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

  const { address, isConnected, chain } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const generateNonceMutation = trpc.auth.generateNonce.useMutation();
  const verifyMutation = trpc.auth.verify.useMutation();
  const checkRegistrationQuery = trpc.auth.checkRegistration.useQuery(
    { address: address! },
    {
      enabled: false, // Only call manually or when needed
      retry: false,
      refetchOnWindowFocus: false,
    },
  );
  const getCurrentUserQuery = trpc.user.getCurrentUser.useQuery(
    undefined, // No input needed for protected procedure
    {
      enabled: false, // Call only when authenticated
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
      console.log(
        '[AuthContext] Status change:',
        status,
        error ? `Error: ${error}` : '',
      );
      setAuthState((prev) => ({
        ...prev,
        status,
        error: error ? error.replace('TRPCClientError: ', '') : null,
      }));
      if (
        status === 'authenticated' ||
        status === 'idle' ||
        status === 'error'
      ) {
        console.log(
          '[AuthContext] Clearing signature data for status:',
          status,
        );
        signatureDataRef.current = {};
      }
    },
    [],
  );

  const resetAuthState = useCallback(() => {
    setUserState({ session: null, user: null, profile: null, newUser: false });
    updateAuthState('idle');
    signatureDataRef.current = {};
  }, [updateAuthState]);

  const logout = useCallback(async () => {
    updateAuthState('idle');
    await supabase.auth.signOut();
    resetAuthState();
  }, [resetAuthState]);

  const performFullLogoutAndReload = useCallback(async () => {
    await supabase.auth.signOut();
    try {
      await disconnectAsync();
      await logout();
    } catch (e) {
      console.error('Error disconnecting wallet:', e);
    } finally {
      window.location.reload();
    }
  }, [disconnectAsync, logout]);

  const fetchUserProfile = useCallback(async (): Promise<IProfile | null> => {
    const sessionData = await supabase.auth.getSession();
    const currentSupabaseUser = sessionData?.data?.session?.user;

    if (!currentSupabaseUser) {
      return null;
    }

    // Ensure local state matches Supabase session user
    if (!userState.user || userState.user.id !== currentSupabaseUser.id) {
      setUserState((prev) => ({ ...prev, user: currentSupabaseUser }));
    }

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
        addToast({
          title: 'Could not load user profile data.',
          color: 'danger',
        });
        return handleError('Get profile failed, please try again.');
      }
    } catch (error: any) {
      addToast({
        title: 'Failed to load user profile. Logging out.',
        color: 'danger',
      });
      return handleError(
        `Failed to fetch profile: ${error.message || 'Please try again later'}`,
      );
    }
  }, [getCurrentUserQuery, userState.user, authState.status, resetAuthState]);

  const handleSupabaseLogin = useCallback(
    async (token: string): Promise<boolean> => {
      updateAuthState('fetching_profile');
      try {
        // Use the token from backend's generateAuthToken to sign in
        const { data: sessionData, error: otpError } =
          await supabase.auth.verifyOtp({
            type: 'magiclink', // Type must match backend generation
            token_hash: token,
          });

        if (otpError) {
          console.error('[AuthContext] Supabase verifyOtp failed:', otpError);
          throw new Error(
            otpError.message || 'Login failed during verification.',
          );
        }
        if (!sessionData?.session || !sessionData?.user) {
          console.error(
            '[AuthContext] Supabase verifyOtp response invalid:',
            sessionData,
          );
          throw new Error('Login verification did not return a valid session.');
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
          return true;
        } else {
          if (authState.status === 'fetching_profile') {
            updateAuthState('error', 'Profile fetch failed after login.');
          }
          return false; // Indicate failure if profile couldn't be fetched
        }
      } catch (error: any) {
        if (authState.status === 'fetching_profile') {
          updateAuthState('error', error.message || 'Login failed.');
        }
        await supabase.auth.signOut(); // Ensure Supabase session is cleared on error
        resetAuthState();
        return false;
      }
    },
    [updateAuthState, fetchUserProfile, resetAuthState],
  );

  const authenticate = useCallback(async () => {
    if (!address || !chain) {
      addToast({
        title: 'Please connect your wallet first.',
        color: 'warning',
      });
      return;
    }
    if (
      authState.status === 'authenticating' ||
      authState.status === 'fetching_profile'
    )
      return;

    updateAuthState('authenticating');
    setUserState((prev) => ({ ...prev, newUser: false }));
    signatureDataRef.current = {};

    try {
      // 1. Get Nonce and Check Registration concurrently
      console.log('[AuthContext] Fetching nonce and checking registration...');
      const [nonceResult, registrationResult] = await Promise.all([
        generateNonceMutation.mutateAsync({ address }),
        checkRegistrationQuery.refetch().then((res) => {
          if (res.error)
            throw new Error(
              `Failed to check registration: ${res.error.message}`,
            );
          if (typeof res.data?.registered !== 'boolean')
            throw new Error('Invalid registration status received.');
          return res.data;
        }),
      ]);

      const nonce = nonceResult?.nonce;
      const isRegistered = registrationResult?.registered;

      if (!nonce) {
        throw new Error('Failed to retrieve nonce from server.');
      }
      console.log(
        `[AuthContext] Nonce received. Registered status (frontend check): ${isRegistered}`,
      );

      const message = createSiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in with Ethereum to the app.',
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
        updateAuthState('awaiting_username');
        return;
      } else {
        const verifyResult = await verifyMutation.mutateAsync({
          address,
          signature,
          message, // No username sent
        });

        if (verifyResult.isNewUser) {
          addToast({
            title: 'Account status mismatch. Please try again.',
            color: 'danger',
          });
          await performFullLogoutAndReload();
          return;
        }

        await handleSupabaseLogin(verifyResult.token);
      }
    } catch (error: any) {
      const errorMessage =
        error.message || 'Authentication failed. Please try again.';
      if (error.code === 'ACTION_REJECTED' || error?.cause?.code === 4001) {
        updateAuthState('idle', 'Signature request rejected.');
        addToast({ title: 'Signature request rejected.', color: 'warning' });
      } else {
        updateAuthState('error', errorMessage.replace('TRPCClientError: ', ''));
      }
      signatureDataRef.current = {}; // Clear signature data on any error
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
    handleSupabaseLogin,
    performFullLogoutAndReload,
  ]);

  const createProfile = useCallback(
    async (username: string) => {
      if (authState.status !== 'awaiting_username') {
        console.warn(
          '[AuthContext] createProfile called with invalid status:',
          authState.status,
        );
        updateAuthState('error', 'Invalid action. Please sign in again.');
        return;
      }

      if (!address) {
        updateAuthState('error', 'Wallet.tsx not connected.');
        return;
      }
      if (
        !signatureDataRef.current.message ||
        !signatureDataRef.current.signature
      ) {
        console.warn(
          '[AuthContext] createProfile called without signature data (status: awaiting_username). Forcing re-auth.',
        );
        updateAuthState(
          'error',
          'Authentication session expired. Please sign in again.',
        );
        return;
      }

      updateAuthState('creating_profile');
      console.log(
        'signatureDataRef before verify in createProfile:',
        signatureDataRef.current,
      );

      try {
        const verifyResult = await verifyMutation.mutateAsync({
          address,
          signature: signatureDataRef.current.signature,
          message: signatureDataRef.current.message,
          username,
        });

        const loginSuccess = await handleSupabaseLogin(verifyResult.token);
        // updateAuthState in handleSupabaseLogin or error handling will clear signatureDataRef
      } catch (error: any) {
        console.error('[AuthContext] Profile creation failed:', error);
        const errorMessage =
          error.message || 'Failed to create profile. Please try again.';
        let displayError = errorMessage.replace('TRPCClientError: ', '');

        // Specific handling for username conflict
        if (
          errorMessage.includes('Username already taken') ||
          (error?.data?.code === 'CONFLICT' &&
            error?.message.includes('Username'))
        ) {
          displayError = 'Username already taken. Please choose another.';
        } else if (error?.data?.code === 'CONFLICT') {
          displayError =
            'This wallet may already be registered. Try logging in.';
        }
        updateAuthState('error', displayError);
        // Keep signature data in case user wants to retry with a different username?
        // No, backend nonce is likely consumed/invalid. Force re-auth.
        signatureDataRef.current = {};
      }
    },
    [
      address,
      authState.status,
      updateAuthState,
      verifyMutation,
      handleSupabaseLogin,
    ],
  );

  useEffect(() => {
    const checkInitialSession = async () => {
      updateAuthState('fetching_profile', null);
      setAuthState((prev) => ({ ...prev, isCheckingInitialAuth: true }));
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          console.log('[AuthContext] Initial session found.');
          setUserState((prev) => ({ ...prev, session, user: session.user }));
          await fetchUserProfile(); // Fetch profile for existing session
          // Fetch User Profile will set status to 'authenticated' or handle errors/logout
        } else {
          console.log('[AuthContext] No initial session found.');
          resetAuthState();
          updateAuthState('idle'); // Ensure status is idle if no session
        }
      } catch (error: any) {
        console.error('[AuthContext] Error checking initial session:', error);
        resetAuthState(); // Reset on error
        updateAuthState('idle'); // Ensure status is idle on error
      } finally {
        setAuthState((prev) => ({ ...prev, isCheckingInitialAuth: false }));
      }
    };
    checkInitialSession();
  }, []);

  const prevIsConnectedRef = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    if (
      prevIsConnectedRef.current === true &&
      !isConnected &&
      authState.status === 'authenticated'
    ) {
      console.log(
        '[AuthContext] Wallet.tsx disconnected while authenticated, logging out.',
      );
      performFullLogoutAndReload();
    }
    prevIsConnectedRef.current = isConnected;
  }, [isConnected, authState.status, performFullLogoutAndReload]);

  const showAuthPrompt = useCallback(
    (source: ConnectSource = 'connectButton') => {
      if (isConnected) {
        // If connected but not authenticated (e.g., error state), allow re-authentication attempt
        if (authState.status !== 'authenticated') {
          resetAuthState(); // Clear previous errors/state
          setAuthState((prev) => ({
            ...prev,
            isPromptVisible: true,
            connectSource: source,
          }));
          // Optionally trigger authenticate() here automatically? Or let user click sign in.
          // authenticate(); // <-- Uncomment to auto-trigger sign-in if wallet already connected
        } else {
          // Already connected and authenticated, maybe just ignore or show profile?
          console.log(
            '[AuthContext] showAuthPrompt called while already authenticated.',
          );
          // Or, treat as a request to switch account? -> force disconnect first.
          disconnectAsync().then(() => {
            resetAuthState();
            setAuthState((prev) => ({
              ...prev,
              isPromptVisible: true,
              connectSource: source,
            }));
          });
        }
      } else {
        // Wallet.tsx not connected
        resetAuthState(); // Clear any previous error/state
        setAuthState((prev) => ({
          ...prev,
          isPromptVisible: true,
          connectSource: source,
        }));
      }
    },
    [
      isConnected,
      disconnectAsync,
      resetAuthState,
      authState.status,
      authenticate,
    ],
  );

  const hideAuthPrompt = useCallback(() => {
    setAuthState((prev) => ({ ...prev, isPromptVisible: false }));
    if (
      authState.status === 'error' &&
      !authState.error?.includes('Username')
    ) {
      resetAuthState();
    }
    if (authState.status === 'authenticated' && userState.newUser) {
      console.log(
        '[AuthContext] User cancelled registration prompt, logging out.',
      );
      performFullLogoutAndReload();
    }
  }, [
    authState.status,
    authState.error,
    userState.newUser,
    resetAuthState,
    performFullLogoutAndReload,
  ]);

  const setConnectSource = useCallback((source: ConnectSource) => {
    setAuthState((prev) => ({ ...prev, connectSource: source }));
  }, []);

  const contextValue: IAuthContext = {
    authStatus: authState.status,
    isCheckingInitialAuth: authState.isCheckingInitialAuth,
    isAuthenticated:
      authState.status === 'authenticated' && !!userState.profile, // Be stricter: require profile
    authError: authState.error,
    user: userState.user,
    profile: userState.profile,
    newUser: userState.newUser, // Expose newUser flag from userState
    isAuthPromptVisible: authState.isPromptVisible,
    connectSource: authState.connectSource,
    isAuthenticating: authState.status === 'authenticating',
    isLoggingIn: authState.status === 'fetching_profile',
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
