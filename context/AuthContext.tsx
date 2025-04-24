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
  // Store message/signature temporarily for createProfile call
  const signatureDataRef = useRef<SignatureData>({});

  const { address, isConnected, chain } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  // tRPC mutations/queries
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

  const performFullLogoutAndReload = useCallback(async () => {
    console.log('[AuthContext] Performing full logout and reload...');
    await supabase.auth.signOut();
    resetAuthState();
    try {
      await disconnectAsync(); // Disconnect wallet
    } catch (e) {
      console.error('Error disconnecting wallet:', e);
    }
    // Use timeout to allow state updates before reload
    setTimeout(() => {
      window.location.reload(); // Reload page
    }, 50); // Short delay
  }, [resetAuthState, disconnectAsync]);

  const fetchUserProfile = useCallback(async (): Promise<IProfile | null> => {
    // Check Supabase session first
    const sessionData = await supabase.auth.getSession();
    const currentSupabaseUser = sessionData?.data?.session?.user;

    if (!currentSupabaseUser) {
      console.warn(
        '[AuthContext] FetchUserProfile: No active Supabase session found.',
      );
      // If context thought it was authenticated, force logout
      if (authState.status === 'authenticated') {
        await performFullLogoutAndReload();
      } else {
        resetAuthState(); // Otherwise just reset state
      }
      return null;
    }

    // Ensure local state matches Supabase session user
    if (!userState.user || userState.user.id !== currentSupabaseUser.id) {
      console.log(
        '[AuthContext] FetchUserProfile: Updating user from session.',
      );
      setUserState((prev) => ({ ...prev, user: currentSupabaseUser }));
    }

    console.log('[AuthContext] Fetching user profile via tRPC...');
    try {
      // Use refetch to ensure fresh data
      const profileData = await getCurrentUserQuery.refetch();
      if (profileData.error) {
        throw profileData.error;
      }
      if (profileData.data) {
        console.log(
          '[AuthContext] Profile fetched successfully:',
          profileData.data.name,
        );
        setUserState((prev) => ({ ...prev, profile: profileData.data }));
        updateAuthState('authenticated');
        return profileData.data;
      } else {
        console.warn(
          '[AuthContext] FetchUserProfile: No profile data returned from tRPC.',
        );
        addToast({
          title: 'Could not load user profile data.',
          color: 'danger',
        });
        await performFullLogoutAndReload(); // Force logout for inconsistent state
        return null;
      }
    } catch (error: any) {
      console.error(
        '[AuthContext] Failed to fetch user profile via tRPC:',
        error,
      );
      addToast({
        title: 'Failed to load user profile. Logging out.',
        color: 'danger',
      });
      await performFullLogoutAndReload(); // Force logout if profile fetch fails
      return null;
    }
  }, [
    getCurrentUserQuery,
    userState.user,
    authState.status,
    resetAuthState,
    performFullLogoutAndReload,
  ]);

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

        console.log(
          '[AuthContext] Supabase login successful, session established.',
        );
        setUserState((prev) => ({
          ...prev,
          session: sessionData.session,
          user: sessionData.user,
        }));

        // Now fetch the profile associated with this user
        const profile = await fetchUserProfile();
        if (profile) {
          updateAuthState('authenticated');
          setUserState((prev) => ({ ...prev, newUser: false }));
          return true;
        } else {
          // fetchUserProfile handles logout if profile fetch fails
          console.warn(
            '[AuthContext] Supabase login succeeded, but profile fetch failed.',
          );
          if (authState.status === 'fetching_profile') {
            updateAuthState('error', 'Profile fetch failed after login.');
          }
          return false; // Indicate failure if profile couldn't be fetched
        }
      } catch (error: any) {
        console.error('[AuthContext] handleSupabaseLogin error:', error);
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

      // 2. Create SIWE message
      const message = createSiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in with Ethereum to the app.',
        uri: window.location.origin,
        version: '1',
        chainId: chain.id,
        nonce: nonce,
      });

      // 3. Sign Message
      updateAuthState('authenticating', 'Waiting for signature...');
      const signature = await signMessageAsync({ message });
      signatureDataRef.current = { message, signature };

      console.log('signatureDataRef', signatureDataRef.current);

      // --- Logic Fork based on Frontend Registration Check ---
      if (!isRegistered) {
        // 4a. New User Flow - Set state to awaiting_username and return
        console.log(
          '[AuthContext] New user detected. Setting state to awaiting_username.',
        );
        setUserState((prev) => ({ ...prev, newUser: true }));
        updateAuthState('awaiting_username');
        return;
      } else {
        // 4b. Existing User Flow - Proceed to verify with backend
        console.log(
          '[AuthContext] Existing user detected (frontend check). Verifying signature with backend...',
        );

        const verifyResult = await verifyMutation.mutateAsync({
          address,
          signature,
          message, // No username sent
        });

        // Backend confirms user exists (isNewUser should be false)
        if (verifyResult.isNewUser) {
          // This indicates a discrepancy between frontend check and backend reality!
          console.error(
            '[AuthContext] CRITICAL MISMATCH: Frontend check said registered, but backend verify returned isNewUser: true. Forcing logout.',
          );
          addToast({
            title: 'Account status mismatch. Please try again.',
            color: 'danger',
          });
          await performFullLogoutAndReload();
          return;
        }

        console.log(
          '[AuthContext] Existing user verified by backend. Logging in...',
        );
        await handleSupabaseLogin(verifyResult.token);
      }
    } catch (error: any) {
      console.error('[AuthContext] Authentication failed:', error);
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

  const logout = useCallback(async () => {
    console.log('[AuthContext] Logging out...');
    await supabase.auth.signOut();
    resetAuthState();
  }, [resetAuthState]);

  // Effect to check initial Supabase session
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
          // fetchUserProfile will set status to 'authenticated' or handle errors/logout
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Effect to handle wallet disconnection while authenticated
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

  // UI Prompt Controls
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
    // Reset error state ONLY if it wasn't a username conflict?
    // If username conflict, keep error message for user to see.
    if (
      authState.status === 'error' &&
      !authState.error?.includes('Username')
    ) {
      resetAuthState();
    }
    // If user cancels during 'newUser' step, log them out.
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
