'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Button } from '@/components/base';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';

interface PrivateSieveRedirectClientProps {
  code: string;
  targetUrl: string;
}

const PrivateSieveRedirectClient = ({
  code,
  targetUrl,
}: PrivateSieveRedirectClientProps) => {
  const router = useRouter();
  const { isAuthenticated, showAuthPrompt } = useAuth();

  const sieveQuery = trpc.sieve.getSieveByCode.useQuery(
    { code },
    {
      enabled: isAuthenticated,
      retry: false,
    },
  );

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (sieveQuery.data) {
      try {
        router.replace(targetUrl);
      } catch {
        window.location.replace(targetUrl);
      }
    }
  }, [isAuthenticated, sieveQuery.data, router, targetUrl]);

  if (!isAuthenticated) {
    return (
      <div className="flex w-full max-w-[420px] flex-col items-center gap-6 rounded-[12px] border border-black/10 bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-black">Private Feed</h1>
        <p className="text-sm text-black/60">
          This feed is private. Sign in with the owning account to open it.
        </p>
        <Button
          color="primary"
          onPress={() => showAuthPrompt('invalidAction')}
          className="px-5"
        >
          Sign in to continue
        </Button>
      </div>
    );
  }

  if (sieveQuery.isLoading || sieveQuery.isFetching) {
    return (
      <div className="flex w-full max-w-[420px] flex-col items-center gap-4 rounded-[12px] border border-black/10 bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-black">Checking access…</h1>
        <p className="text-sm text-black/60">
          Verifying that you own this feed.
        </p>
      </div>
    );
  }

  if (sieveQuery.error) {
    const message =
      sieveQuery.error.data?.code === 'FORBIDDEN'
        ? 'You do not have permission to view this feed.'
        : 'Feed not found or unavailable.';

    return (
      <div className="flex w-full max-w-[420px] flex-col items-center gap-4 rounded-[12px] border border-black/10 bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-black">Access denied</h1>
        <p className="text-sm text-[#D14343]">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[420px] flex-col items-center gap-4 rounded-[12px] border border-black/10 bg-white p-8 text-center shadow-sm">
      <h1 className="text-lg font-semibold text-black">Redirecting…</h1>
      <p className="text-sm text-black/60">
        Opening your feed. You may close this window if nothing happens.
      </p>
    </div>
  );
};

export default PrivateSieveRedirectClient;
