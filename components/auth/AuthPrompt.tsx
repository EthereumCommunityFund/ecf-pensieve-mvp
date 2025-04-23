'use client';

import {
  Button, // Assuming Button, Input, Spinner from HeroUI
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  addToast,
} from '@heroui/react';
import { X } from '@phosphor-icons/react';
import { ConnectButton } from '@rainbow-me/rainbowkit'; // Assuming RainbowKit for connect button
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

import { useAuth } from '@/context/AuthContext'; // Adjust path

import ECFButton from '../base/button';

// Reusable Auth Button (similar to Zuzalu's)
const AuthButton = ({
  children,
  isLoading,
  ...props
}: React.ComponentProps<typeof Button> & { isLoading?: boolean }) => (
  <Button {...props} disabled={props.disabled || isLoading}>
    {isLoading ? <Spinner size="sm" color="current" /> : children}
  </Button>
);

// Reusable Close Button
const CloseButton = ({ onPress }: { onPress: () => void }) => (
  <Button
    onPress={onPress}
    className="size-auto min-w-0 bg-transparent p-0 opacity-60 transition-opacity hover:opacity-100"
    aria-label="Close"
  >
    <X size={20} weight="light" className="text-gray-600 hover:text-gray-900" />
  </Button>
);

const AuthPrompt: React.FC = () => {
  const {
    authStatus,
    isAuthPromptVisible,
    hideAuthPrompt,
    authenticate,
    createProfile,
    newUser,
    profile,
    authError,
    connectSource,
    performFullLogoutAndReload, // Use this for hard reset on close sometimes
    isAuthenticating, // Combined flag
    isCreatingProfile,
    isLoggingIn,
  } = useAuth();
  const { isConnected, address } = useAccount();
  const [inputUsername, setInputUsername] = useState('');

  const isLoading = isAuthenticating || isCreatingProfile || isLoggingIn;
  const maxUsernameLength = 50; // Match backend validation?

  // Reset input when prompt becomes visible or user logs out inside prompt
  useEffect(() => {
    if (isAuthPromptVisible) {
      setInputUsername(''); // Reset on open
    }
  }, [isAuthPromptVisible]);

  // Reset input username if an error occurs during profile creation
  useEffect(() => {
    if (authStatus === 'error' && authError?.includes('Username')) {
      // Keep prompt open but maybe clear input or indicate error
      // setInputUsername(''); // Optional: clear input on username taken error
    }
  }, [authStatus, authError]);

  const onInputChange = useCallback(
    (value: string) => {
      setInputUsername(
        value.length <= maxUsernameLength
          ? value
          : value.slice(0, maxUsernameLength),
      );
    },
    [maxUsernameLength],
  );

  const handleContinue = useCallback(async () => {
    if (!inputUsername.trim()) {
      addToast({ title: 'Please enter a username.', color: 'warning' });
      return;
    }
    await createProfile(inputUsername.trim());
  }, [inputUsername, createProfile]);

  // Decide when to fully logout vs just hide the prompt on close
  const handleClose = useCallback(() => {
    if (authStatus === 'authenticated' && !profile) {
      // If stuck in a state where auth succeeded but profile missing, force logout on close
      performFullLogoutAndReload();
    } else {
      // Use the hideAuthPrompt logic from context which handles cancellation during registration
      hideAuthPrompt();
    }
  }, [authStatus, profile, hideAuthPrompt, performFullLogoutAndReload]);

  const renderConnectWalletContent = useMemo(() => {
    const title =
      connectSource === 'invalidAction'
        ? 'Sign in Required'
        : 'Sign in to Pensieve';
    const description =
      connectSource === 'invalidAction'
        ? 'Please sign in or register to perform this action.'
        : 'Connect your wallet and sign a message to continue.';

    return (
      <>
        <div className="flex w-full items-center justify-between border-b border-gray-200 p-5">
          <ModalHeader className="p-0 text-lg font-semibold text-gray-900">
            {title}
          </ModalHeader>
          <CloseButton onPress={hideAuthPrompt} />
        </div>
        <ModalBody className="gap-4 px-5 pb-5 pt-4">
          <p className="text-sm text-gray-600">{description}</p>
          {/* Use RainbowKit ConnectButton or your preferred connect component */}
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <ECFButton
                          onPress={openConnectModal}
                          color="primary"
                          className="w-full"
                          isLoading={isLoading} // Show loading if auth started before connection
                        >
                          Connect Wallet
                        </ECFButton>
                      );
                    }
                    // Wallet.tsx is connected, trigger authentication
                    return (
                      <ECFButton
                        onPress={authenticate}
                        color="primary"
                        className="w-full"
                        isLoading={isLoading}
                      >
                        {isAuthenticating
                          ? 'Check Wallet...'
                          : isLoggingIn
                            ? 'Logging In...'
                            : 'Sign In'}
                      </ECFButton>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
          {authStatus === 'error' && authError && (
            <p className="mt-2 text-center text-sm text-red-500">{authError}</p>
          )}
        </ModalBody>
        <div className="w-full rounded-b-lg border-t border-gray-200 bg-gray-50 px-5 py-3">
          <p className="text-center text-xs text-gray-500">
            Wallet connection secured by SIWE.
          </p>
        </div>
      </>
    );
  }, [
    connectSource,
    hideAuthPrompt,
    authenticate,
    isLoading,
    authStatus,
    authError,
  ]);

  const renderNewUserContent = useMemo(() => {
    return (
      <>
        <div className="flex w-full items-center justify-between border-b border-gray-200 p-5">
          <ModalHeader className="p-0 text-lg font-semibold text-gray-900">
            Welcome to Pensieve!
          </ModalHeader>
          {/* Allow closing, use handleClose logic which triggers logout if registration cancelled */}
          <CloseButton onPress={handleClose} />
        </div>
        <ModalBody className="gap-5 px-5 pb-5 pt-4">
          <p className="text-sm text-gray-600">
            Your wallet is verified. Please choose a username to complete your
            registration.
          </p>
          <div>
            <label
              htmlFor="usernameInput"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <Input
              id="usernameInput"
              placeholder="Enter your desired username"
              value={inputUsername}
              onValueChange={onInputChange}
              className="h-10 text-gray-900"
              classNames={{
                inputWrapper:
                  'bg-white border-gray-300 focus-within:border-blue-500',
              }}
              disabled={isCreatingProfile}
              maxLength={maxUsernameLength}
            />
            {authStatus === 'error' && authError && (
              <p className="mt-2 text-sm text-red-500">{authError}</p>
            )}
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-3 border-t border-gray-200 px-5 pb-5 pt-4">
          {/* Optional: Add a "Cancel" button that performs logout? handleClose already does this */}
          {/* <AuthButton onPress={handleClose} className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300" disabled={isCreatingProfile}>
              Cancel & Log Out
           </AuthButton> */}
          <ECFButton
            onPress={handleContinue}
            color="primary"
            isDisabled={!inputUsername || isCreatingProfile}
            isLoading={isCreatingProfile}
          >
            Continue & Sign In
          </ECFButton>
        </ModalFooter>
      </>
    );
  }, [
    inputUsername,
    onInputChange,
    handleContinue,
    isCreatingProfile,
    authError,
    handleClose,
    authStatus,
  ]);

  const renderLoggedInContent = useMemo(() => {
    return (
      <>
        <div className="flex w-full items-center justify-between border-b border-gray-200 p-5">
          <ModalHeader className="p-0 text-lg font-semibold text-gray-900">
            You're all set!
          </ModalHeader>
          <CloseButton onPress={hideAuthPrompt} />
        </div>
        <ModalBody className="px-5 pb-5 pt-4">
          {profile?.name && (
            <p className="mb-4 text-center text-xl font-semibold text-gray-800">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                {profile.name}
              </span>
              !
            </p>
          )}
          <p className="text-center text-sm text-gray-600">
            You are now logged in and ready to use Pensieve.
          </p>
        </ModalBody>
        <ModalFooter className="border-t border-gray-200 px-5 pb-5 pt-4">
          <ECFButton
            onPress={hideAuthPrompt}
            color="primary"
            className="w-full"
          >
            Let's Go!
          </ECFButton>
        </ModalFooter>
      </>
    );
  }, [profile, hideAuthPrompt]);

  const renderModalContent = useCallback(() => {
    if (!isConnected) {
      return renderConnectWalletContent;
    }

    switch (authStatus) {
      case 'idle':
      case 'error':
      case 'authenticating': // Show connect/sign-in during initial auth steps
        return renderConnectWalletContent;

      // Add the new state check here:
      case 'awaiting_username':
        // Render the username input form
        return renderNewUserContent;

      case 'authenticated':
        // Now, authenticated status *only* means fully logged in (implicitly newUser is false)
        if (profile) {
          return renderLoggedInContent;
        } else {
          // Profile might still be fetching after handleSupabaseLogin completed
          // Show profile loading state
          return (
            <ModalBody className="flex items-center justify-center p-10">
              <Spinner
                label="Loading profile..."
                size="lg"
                className="text-gray-700"
              />
            </ModalBody>
          );
        }

      case 'creating_profile':
        // Show username input form but with loading state on the button
        return renderNewUserContent;

      case 'fetching_profile': // Changed from 'logging_in'
        // Show a generic loading state while verifying token and fetching profile
        return (
          <ModalBody className="flex items-center justify-center p-10">
            <Spinner
              label="Verifying & Loading..."
              size="lg"
              className="text-gray-700"
            />
          </ModalBody>
        );

      default:
        return (
          <ModalBody className="flex items-center justify-center p-10">
            <Spinner label="Loading..." size="lg" className="text-gray-700" />
          </ModalBody>
        );
    }
  }, [
    isConnected,
    authStatus,
    profile,
    renderConnectWalletContent,
    renderNewUserContent,
    renderLoggedInContent,
  ]);

  return (
    <Modal
      isOpen={isAuthPromptVisible}
      onClose={handleClose} // Use controlled close handler
      placement="center"
      hideCloseButton={true}
      size="md" // Adjust size as needed
      isDismissable={false} // Prevent closing by clicking outside during critical flows
      backdrop="opaque"
      className="rounded-lg border border-gray-200 bg-white text-gray-900 shadow-xl"
      classNames={{
        backdrop: 'bg-gray-900/30 backdrop-blur-sm',
      }}
    >
      <ModalContent>{renderModalContent()}</ModalContent>
    </Modal>
  );
};

export default AuthPrompt;
