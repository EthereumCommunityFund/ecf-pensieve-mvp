import { Wallet } from '@phosphor-icons/react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import React, { useCallback } from 'react';
import { useAccount } from 'wagmi';

import { Button } from '@/components/base';
import { useAuth } from '@/context/AuthContext';

export interface IConnectWalletButtonProps {
  isLoading?: boolean;
  authenticate: () => Promise<void>;
  onInitiateConnect: () => void;
}

const ConnectWalletButton: React.FC<IConnectWalletButtonProps> = ({
  isLoading: ceramicLoading,
  authenticate,
  onInitiateConnect,
}) => {
  const { isCheckingInitialAuth } = useAuth();
  const { openConnectModal } = useConnectModal();
  const { isConnected, isConnecting: wagmiConnecting } = useAccount();

  const isLoading = wagmiConnecting || ceramicLoading;

  const handleConnect = useCallback(async () => {
    if (!isConnected) {
      onInitiateConnect();
      if (openConnectModal) {
        openConnectModal();
      } else {
        console.error('openConnectModal is not available');
      }
    } else {
      try {
        await authenticate();
      } catch (error) {
        console.error('Error during authenticate call:', error);
      }
    }
  }, [isConnected, openConnectModal, authenticate, onInitiateConnect]);

  return (
    <Button
      startContent={
        isLoading ? null : (
          <Wallet size={20} weight={'fill'} format={'Stroke'} />
        )
      }
      isDisabled={isCheckingInitialAuth || isLoading}
      onPress={handleConnect}
      isLoading={isLoading}
    >
      {isConnected
        ? ceramicLoading
          ? 'Signing In...'
          : 'Sign In Message'
        : 'Connect Wallet'}
    </Button>
  );
};

export default ConnectWalletButton;
