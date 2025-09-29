'use client';

import { useCallback, useMemo } from 'react';

import { trpc, type RouterOutputs } from '@/lib/trpc/client';
import { buildAbsoluteUrl } from '@/lib/utils/url';

export type ShareEntityType = 'proposal' | 'itemProposal' | 'project';

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
      enabled: false,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );

  const ensureShareLink = useCallback(async () => {
    if (!isEnabled) {
      return null;
    }
    const result = await query.refetch();
    return result.data ?? null;
  }, [isEnabled, query]);

  const refreshShareLink = useCallback(async () => {
    if (!isEnabled) {
      return null;
    }
    const result = await query.refetch();
    return result.data ?? null;
  }, [isEnabled, query]);

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

  const shareImageUrl = useMemo(() => {
    if (query.data?.code) {
      const imagePath = `/api/share/og-image/${query.data.code}`;
      const withVersion = query.data.imageVersion
        ? `${imagePath}?v=${query.data.imageVersion}`
        : imagePath;
      return buildAbsoluteUrl(withVersion);
    }
    return null;
  }, [query.data]);

  return {
    shareUrl,
    shareImageUrl,
    payload: query.data ?? null,
    loading: query.isFetching && !query.data,
    error: query.error ? query.error.message : null,
    refresh: refreshShareLink,
    ensure: ensureShareLink,
  } as const;
};

export default useShareLink;
