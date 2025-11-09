'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { Button } from '@/components/base';
import FilterConditionsDisplay from '@/components/pages/sieve/FilterConditionsDisplay';
import SieveInfoSection from '@/components/pages/sieve/SieveInfoSection';
import SievePageSkeleton from '@/components/pages/sieve/SievePageSkeleton';
import SieveProjectResults from '@/components/pages/sieve/SieveProjectResults';
import { useAuth } from '@/context/AuthContext';
import { parseTargetPathToConditions } from '@/lib/services/sieveFilterService';
import { trpc } from '@/lib/trpc/client';
import type { StoredSieveFilterConditions } from '@/types/sieve';

const PublicSievePage = () => {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const { profile, showAuthPrompt } = useAuth();
  const utils = trpc.useUtils();

  const code = params?.code ? String(params.code) : '';

  const sieveQuery = trpc.sieve.getPublicSieveByCode.useQuery(
    { code },
    {
      enabled: Boolean(code),
      retry: false,
    },
  );

  const sieve = sieveQuery.data;

  const filterConditions: StoredSieveFilterConditions | null = useMemo(() => {
    if (sieve?.filterConditions) {
      return sieve.filterConditions;
    }
    if (sieve?.targetPath) {
      return parseTargetPathToConditions(sieve.targetPath);
    }
    return null;
  }, [sieve]);

  const followMutation = trpc.sieve.followSieve.useMutation({
    onSuccess: async () => {
      await utils.sieve.getUserFollowedSieves.invalidate();
      await sieveQuery.refetch();
    },
  });

  const unfollowMutation = trpc.sieve.unfollowSieve.useMutation({
    onSuccess: async () => {
      await utils.sieve.getUserFollowedSieves.invalidate();
      await sieveQuery.refetch();
    },
  });

  const handleFollowToggle = () => {
    if (!sieve) {
      return;
    }

    if (!profile) {
      showAuthPrompt();
      return;
    }

    if (sieve.isOwner) {
      return;
    }

    if (sieve.isFollowing) {
      unfollowMutation.mutate({ sieveId: sieve.id });
    } else {
      followMutation.mutate({ sieveId: sieve.id });
    }
  };

  if (sieveQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1080px] px-[16px] py-[32px]">
        <SievePageSkeleton />
      </div>
    );
  }

  const errorCode = sieveQuery.error?.data?.code;

  if (errorCode === 'FORBIDDEN') {
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-4 px-[16px] py-[64px] text-center">
        <h1 className="text-[22px] font-semibold text-black">Access denied</h1>
        <p className="text-[14px] text-black/55">
          This feed is private. Please request access from the owner.
        </p>
        <Button
          color="primary"
          onPress={() => router.push('/projects')}
          className="mt-[8px]"
        >
          Browse Projects
        </Button>
      </div>
    );
  }

  if (!sieve || !filterConditions) {
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-4 px-[16px] py-[64px] text-center">
        <h1 className="text-[22px] font-semibold text-black">Feed not found</h1>
        <p className="text-[14px] text-black/55">
          The feed you&apos;re looking for may have been removed or is no longer
          available.
        </p>
        <Button
          color="primary"
          onPress={() => router.push('/projects')}
          className="mt-[8px]"
        >
          Explore Projects
        </Button>
      </div>
    );
  }

  const followButtonDisabled =
    followMutation.isPending || unfollowMutation.isPending || sieve.isOwner;

  const followButtonLabel = sieve.isOwner
    ? 'You own this feed'
    : sieve.isFollowing
      ? 'Unfollow Feed'
      : 'Follow Feed';

  return (
    <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-[20px] px-[16px] py-[32px]">
      <SieveInfoSection
        sieve={sieve}
        mode="public"
        creator={sieve.creator ?? null}
        actions={
          <Button
            size="sm"
            color={sieve.isFollowing ? 'secondary' : 'primary'}
            onPress={handleFollowToggle}
            isDisabled={followButtonDisabled}
            isLoading={followMutation.isPending || unfollowMutation.isPending}
          >
            {followButtonLabel}
          </Button>
        }
      />

      <FilterConditionsDisplay conditions={filterConditions} />

      <SieveProjectResults conditions={filterConditions} mode="public" />
    </div>
  );
};

export default PublicSievePage;
