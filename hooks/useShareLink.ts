'use client';

import { useMemo } from 'react';

import { trpc, type RouterOutputs } from '@/lib/trpc/client';
import { buildAbsoluteUrl } from '@/lib/utils/url';

export type ShareEntityType = 'proposal' | 'itemProposal';

export interface UseShareLinkOptions {
  entityType: ShareEntityType;
  entityId?: number | string;
  fallbackUrl?: string;
  enabled?: boolean;
}

export type ShareLinkPayload = RouterOutputs['share']['ensure'];

export const useShareLink = ({
  entityType,
  entityId,
  fallbackUrl,
  enabled = true,
}: UseShareLinkOptions) => {
  const isEnabled = enabled && entityId !== undefined && entityId !== null;

  const query = trpc.share.ensure.useQuery(
    {
      entityType,
      entityId: (entityId ?? 0) as number | string,
    },
    {
      enabled: isEnabled,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );

  const shareUrl = useMemo(() => {
    if (query.data?.shareUrl) {
      return query.data.shareUrl;
    }
    if (fallbackUrl) {
      return buildAbsoluteUrl(fallbackUrl);
    }
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  }, [query.data, fallbackUrl]);

  return {
    shareUrl,
    payload: query.data ?? null,
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refresh: query.refetch,
    ensure: query.refetch,
  } as const;
};

export default useShareLink;
