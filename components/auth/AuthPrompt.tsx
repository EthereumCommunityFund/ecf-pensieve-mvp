'use client';

import { addToast, InputOtp, Spinner } from '@heroui/react';
import { X } from '@phosphor-icons/react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAccount, useDisconnect, useEnsName } from 'wagmi';

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@/components/base';
import { CreateProfileErrorPrefix, useAuth } from '@/context/AuthContext';

import AgreementModal from './AgreementModal';
import ConnectWalletButton from './ConnectWalletButton';

type LoadingButtonType = 'skip' | 'continue' | null;

// Format address to 0x0000...000000 pattern
const formatDisplayedAddress = (address: string): string => {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
};

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
    className="size-[30px] min-w-0 border-none bg-transparent p-0 opacity-60 transition-opacity hover:opacity-100"
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
    isNewUserRegistration,
    profile,
    authError,
    connectSource,
    logout,
    performFullLogoutAndReload, // Use this for hard reset on close sometimes
    isAuthenticating, // Combined flag
    isCreatingProfile,
    isFetchingProfile,
    isLoggingIn,
  } = useAuth();

  const { disconnectAsync } = useDisconnect();
  const { isConnected, address } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const [inputUsername, setInputUsername] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loadingButton, setLoadingButton] = useState<LoadingButtonType>(null);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const connectionIntentRef = useRef(false);

  const isLoading = isAuthenticating || isCreatingProfile || isLoggingIn;
  const maxUsernameLength = 50;

  useEffect(() => {
    if (
      isConnected &&
      authStatus === 'idle' &&
      isAuthPromptVisible &&
      connectionIntentRef.current
    ) {
      connectionIntentRef.current = false;
      authenticate().catch((err) => {
        console.error(
          '[NewAuthPrompt] Authentication triggered by useEffect failed:',
          err,
        );
        addToast({
          title: err.message || 'Authentication failed',
          color: 'danger',
          timeout: 2000,
        });
      });
    }

    if ((!isAuthPromptVisible || !isConnected) && connectionIntentRef.current) {
      connectionIntentRef.current = false;
    }
  }, [isConnected, authStatus, isAuthPromptVisible, authenticate]);

  useEffect(() => {
    if (isAuthPromptVisible) {
      setInputUsername('');
      setInviteCode('');
      setShowAgreementModal(false);
    }
  }, [isAuthPromptVisible]);

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

  const handleProfileAction = useCallback(
    async (options: {
      useInputUsername?: boolean;
      buttonType: LoadingButtonType;
    }) => {
      const { useInputUsername = false, buttonType } = options;

      if (address) {
        setLoadingButton(buttonType);

        try {
          const usernameToUse = useInputUsername
            ? inputUsername
            : ((ensName || formatDisplayedAddress(address)) as string);

          await createProfile(usernameToUse, inviteCode);
        } catch (e: any) {
          addToast({
            title: e.message || 'Fail to create profile',
            color: 'danger',
            timeout: 2000,
          });
        } finally {
          setLoadingButton(null);
        }
      }
    },
    [address, ensName, inputUsername, inviteCode, createProfile],
  );

  const handleSkip = useCallback(() => {
    return handleProfileAction({ buttonType: 'skip' });
  }, [handleProfileAction]);

  const handleContinue = useCallback(() => {
    setShowAgreementModal(true);
  }, []);

  const handleAgreementComplete = useCallback(() => {
    setShowAgreementModal(false);
    return handleProfileAction({
      useInputUsername: true,
      buttonType: 'continue',
    });
  }, [handleProfileAction]);

  const handleAgreementCancel = useCallback(() => {
    setShowAgreementModal(false);
  }, []);

  const handleCloseAndReset = useCallback(async () => {
    setInputUsername('');
    setInviteCode('');
    try {
      await disconnectAsync();
    } catch (error) {
      console.error('Error disconnecting wallet during close:', error);
    }
    await hideAuthPrompt();
    await logout();
  }, [hideAuthPrompt, logout, disconnectAsync]);

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
        <div className="flex w-full items-center justify-between border-b border-gray-200 px-[20px] py-[10px]">
          <ModalHeader className="p-0 text-lg font-semibold text-gray-900">
            {title}
          </ModalHeader>
          <CloseButton onPress={handleCloseAndReset} />
        </div>
        <ModalBody className="gap-[10px] pb-5">
          <p className="text-[14px] leading-[1.4] text-black/80">
            {description}
          </p>
          <ConnectWalletButton
            isLoading={isAuthenticating || isFetchingProfile}
            authenticate={authenticate}
            onInitiateConnect={() => {
              connectionIntentRef.current = true;
            }}
          />
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
    authenticate,
    handleCloseAndReset,
    isAuthenticating,
    isFetchingProfile,
  ]);

  const renderNewUserContent = useMemo(() => {
    const isAnyLoading = loadingButton !== null;
    return (
      <>
        <div className="flex w-full items-center justify-between border-b border-gray-200 px-[20px] py-[10px]">
          <ModalHeader className="p-0 text-lg font-semibold text-gray-900">
            Sign Up
          </ModalHeader>
          <CloseButton onPress={handleCloseAndReset} />
        </div>
        <ModalBody className="gap-5 px-5 pb-5 pt-4">
          <p className="text-sm text-gray-600">
            {`Let's create your username. You can skip this or change it later. Default will be your address.`}
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
          </div>

          <div>
            <label
              htmlFor="inviteCodeInput"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Invitation Code <span className="text-red-500">*</span>
            </label>
            <InputOtp
              length={6}
              value={inviteCode}
              onValueChange={setInviteCode}
              placeholder="-"
              allowedKeys="^.*$"
              isDisabled={isCreatingProfile}
              variant="bordered"
              color="primary"
              size="md"
              classNames={{
                base: 'gap-2',
                segmentWrapper: 'gap-2',
                segment:
                  'w-10 h-10 text-center border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
              }}
            />
          </div>

          <div className="flex justify-between gap-[10px]">
            {/* <Button
              color="secondary"
              className="flex-1"
              onPress={handleSkip}
              isDisabled={isAnyLoading}
              isLoading={loadingButton === 'skip'}
            >
              Skip
            </Button> */}
            <Button
              onPress={handleContinue}
              color="primary"
              className="flex-1"
              isDisabled={
                !inputUsername ||
                !inviteCode ||
                inviteCode.length !== 6 ||
                isAnyLoading
              }
              isLoading={loadingButton === 'continue'}
            >
              Continue
            </Button>
          </div>

          <div>
            <p className="text-[13px] font-[700] leading-[20px] text-black/80">
              Do not have PoC Invitation Code?
            </p>
            <p className="mt-[10px] text-[13px] font-[400] leading-[20px] text-black/80">
              To apply for testing, you could introduce yourself to the
              community in our Discord Server Or speed up the process by
              catching invitation officer's attention here (
              <a
                className={'underline hover:text-black/50'}
                href={'https://discord.gg/wfrX6dMe'}
                target={'_blank'}
                rel="noreferrer"
              >
                link to application
              </a>
              ). Invitation code will be distributed in ECF Discord in direct
              messages.
            </p>
          </div>
        </ModalBody>
      </>
    );
  }, [
    inputUsername,
    inviteCode,
    onInputChange,
    handleContinue,
    isCreatingProfile,
    handleCloseAndReset,
    loadingButton,
  ]);

  const renderLoggedInContent = useMemo(() => {
    const username = profile?.name;
    return (
      <>
        <div className="flex w-full items-center justify-between border-b border-gray-200 px-[20px] py-[10px]">
          <ModalHeader className="p-0 text-lg font-semibold text-gray-900">
            Sign In
          </ModalHeader>
          <CloseButton onPress={hideAuthPrompt} />
        </div>
        <ModalBody>
          <div className="flex flex-col gap-[10px]">
            <div className="text-[16px] leading-[1.6] text-black/80">
              {isNewUserRegistration ? `You're All Set` : 'Welcome Back,'}
            </div>
            <span className="text-[20px] font-[700] leading-[1.2] text-[#28C196]">
              {username}!
            </span>
          </div>
          <div className="mt-[10px]">
            <Button
              onPress={hideAuthPrompt}
              color="secondary"
              className="w-full rounded-[8px] bg-[#F5F5F5]"
            >
              Close
            </Button>
          </div>
        </ModalBody>
      </>
    );
  }, [profile, hideAuthPrompt, isNewUserRegistration]);

  const renderModalContent = useCallback(() => {
    if (!isConnected) {
      return renderConnectWalletContent;
    }

    switch (authStatus) {
      case 'idle':
      case 'authenticating':
        return renderConnectWalletContent;

      case 'creating_profile':
        return renderNewUserContent;

      case 'fetching_profile':
        if (newUser) {
          return renderNewUserContent;
        } else {
          return renderConnectWalletContent;
        }

      case 'authenticated':
        if (newUser) {
          return renderNewUserContent;
        } else {
          return renderLoggedInContent;
        }

      case 'error':
        if (authError?.includes(CreateProfileErrorPrefix)) {
          return renderNewUserContent;
        }
        return renderConnectWalletContent;

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
    renderConnectWalletContent,
    renderNewUserContent,
    renderLoggedInContent,
    newUser,
    authError,
  ]);

  return (
    <>
      <Modal
        isOpen={isAuthPromptVisible}
        onClose={hideAuthPrompt}
        placement="center"
        hideCloseButton={true}
        size="md"
        isDismissable={false}
        backdrop="opaque"
        className="rounded-lg border border-gray-200 bg-white text-gray-900 shadow-xl"
        classNames={{
          base: 'p-0 w-[420px] mobile:w-[calc(90vw)]',
          backdrop: 'bg-gray-900/30 backdrop-blur-sm',
        }}
      >
        <ModalContent>{renderModalContent()}</ModalContent>
      </Modal>

      <AgreementModal
        isOpen={showAgreementModal}
        onComplete={handleAgreementComplete}
        onCancel={handleAgreementCancel}
      />
    </>
  );
};

export default AuthPrompt;
