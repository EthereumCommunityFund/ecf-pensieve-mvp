'use client';

import { Spinner } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useMemo } from 'react';

import { AdminAccessDenied } from '@/components/admin/AdminAccessDenied';
import {
  AdminAccessContextValue,
  AdminAccessProvider,
} from '@/components/admin/AdminAccessContext';
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

export const AdminAccessBoundary = ({
  children,
}: AdminAccessBoundaryProps) => {
  const router = useRouter();
  const {
    isAuthenticated,
    isCheckingInitialAuth,
    profile,
    showAuthPrompt,
    isAuthPromptVisible,
  } = useAuth();

  const hasWalletAddress = Boolean(profile?.address);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = trpc.adminWhitelist.checkAccess.useQuery(undefined, {
    enabled: isAuthenticated && hasWalletAddress,
    retry: false,
  });

  if (isCheckingInitialAuth) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return (
      <AdminAccessDenied
        title="管理员访问受限"
        description="请连接已授权的钱包以访问运营管理页面。"
        primaryActionLabel={isAuthPromptVisible ? undefined : '连接钱包'}
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
        title="需要绑定钱包地址"
        description="当前账号尚未绑定钱包地址，请在个人设置中完成钱包绑定后再尝试访问。"
        primaryActionLabel="前往个人设置"
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
        title="管理员访问校验失败"
        description="暂时无法验证白名单权限，请稍后重试。"
        primaryActionLabel="重新尝试"
        onPrimaryAction={() => {
          refetch().catch(() => {});
        }}
      />
    );
  }

  if (!data?.isWhitelisted) {
    const description =
      data?.reason === 'disabled'
        ? '该钱包已被禁用，请联系运营团队重新授权。'
        : '当前钱包不在管理员白名单中，如需访问请联系运营团队开通权限。';

    return (
      <AdminAccessDenied
        title="暂无管理员权限"
        description={description}
        secondaryActionLabel="返回首页"
        onSecondaryAction={() => {
          router.push('/');
        }}
      />
    );
  }

  const contextValue: AdminAccessContextValue = useMemo(
    () => ({
      walletAddress: profile?.address ?? null,
      normalizedAddress: data.normalizedAddress,
      role: data.role,
      source: data.source,
    }),
    [data.normalizedAddress, data.role, data.source, profile?.address],
  );

  return (
    <AdminAccessProvider value={contextValue}>{children}</AdminAccessProvider>
  );
};
