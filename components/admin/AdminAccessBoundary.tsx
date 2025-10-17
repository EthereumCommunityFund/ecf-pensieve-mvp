'use client';

import { Spinner } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

import {
  AdminAccessContextValue,
  AdminAccessProvider,
} from '@/components/admin/AdminAccessContext';
import { AdminAccessDenied } from '@/components/admin/AdminAccessDenied';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';

type AdminAccessBoundaryProps = {
  children: ReactNode;
};

const LoadingState = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner size="lg" className="text-black" />
    </div>
  );
};

export const AdminAccessBoundary = ({ children }: AdminAccessBoundaryProps) => {
  const router = useRouter();
  const {
    isAuthenticated,
    isCheckingInitialAuth,
    profile,
    showAuthPrompt,
    isAuthPromptVisible,
  } = useAuth();

  const hasWalletAddress = Boolean(profile?.address);

  const { data, isLoading, isFetching, error, refetch } =
    trpc.adminWhitelist.checkAccess.useQuery(undefined, {
      enabled: isAuthenticated && hasWalletAddress,
      retry: false,
    });

  if (isCheckingInitialAuth) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return (
      <AdminAccessDenied
        title="Admin Access Required"
        description="Connect an authorized wallet to continue to the admin tools."
        primaryActionLabel={isAuthPromptVisible ? undefined : 'Connect Wallet'}
        onPrimaryAction={() => {
          if (!isAuthPromptVisible) {
            showAuthPrompt('invalidAction');
          }
        }}
      />
    );
  }

  if (!hasWalletAddress) {
    return (
      <AdminAccessDenied
        title="Wallet Address Required"
        description="Bind a wallet address in your profile settings before accessing the admin console."
        primaryActionLabel="Go to Settings"
        onPrimaryAction={() => {
          if (profile?.address) {
            router.push(`/profile/${profile.address}?tab=settings`);
          } else {
            router.push('/profile');
          }
        }}
      />
    );
  }

  if (isLoading || isFetching) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <AdminAccessDenied
        title="Verification Failed"
        description="We were unable to validate your admin permissions. Please try again shortly."
        primaryActionLabel="Retry"
        onPrimaryAction={() => {
          refetch().catch(() => {});
        }}
      />
    );
  }

  if (!data?.isWhitelisted) {
    const description =
      data?.reason === 'disabled'
        ? 'This wallet has been disabled. Contact the operations team to restore access.'
        : 'This wallet is not on the admin whitelist. Contact the operations team if you need access.';

    return (
      <AdminAccessDenied
        title="Admin Access Denied"
        description={description}
        secondaryActionLabel="Back to Home"
        onSecondaryAction={() => {
          router.push('/');
        }}
      />
    );
  }

  const contextValue: AdminAccessContextValue = {
    walletAddress: profile?.address ?? null,
    normalizedAddress: data.normalizedAddress,
    role: data.role,
    source: data.source,
  };

  return (
    <AdminAccessProvider value={contextValue}>{children}</AdminAccessProvider>
  );
};
