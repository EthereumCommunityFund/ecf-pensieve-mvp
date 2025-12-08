import { useEffect, useMemo, useRef, useState } from 'react';

import { trpc } from '@/lib/trpc/client';

import {
  mapThreadToMeta,
  type ThreadListItem,
  type ThreadMeta,
} from '../utils/threadTransforms';

export type UseDiscussionThreadsParams = {
  projectId?: number;
  categories?: string[];
  tags?: string[];
  limit?: number;
  enabled?: boolean;
  sort?: 'top' | 'new';
  status?: 'all' | 'redressed' | 'unanswered';
  isScam?: boolean;
  alertOnly?: boolean;
};

export const useDiscussionThreads = ({
  projectId,
  categories = [],
  tags = [],
  limit = 20,
  enabled = true,
  sort = 'new',
  status = 'all',
  isScam,
  alertOnly = false,
}: UseDiscussionThreadsParams) => {
  const normalizedCategories = categories.filter(Boolean);
  const normalizedTags = tags.filter(Boolean);
  const sortBy = sort === 'top' ? 'votes' : 'recent';
  const scamFilter = isScam ? true : undefined;
  const paramsSignature = useMemo(
    () =>
      JSON.stringify({
        projectId,
        categories: normalizedCategories,
        tags: normalizedTags,
        limit,
        sort,
        status,
        isScam: scamFilter,
        alertOnly,
      }),
    [
      alertOnly,
      normalizedCategories,
      normalizedTags,
      limit,
      projectId,
      scamFilter,
      sort,
      status,
    ],
  );
  const lastParamsSignatureRef = useRef<string>(paramsSignature);
  const [isTransitioningParams, setIsTransitioningParams] =
    useState<boolean>(false);

  const listQuery = trpc.projectDiscussionThread.listThreads.useInfiniteQuery(
    {
      projectId,
      category:
        normalizedCategories.length > 0 ? normalizedCategories : undefined,
      tags: normalizedTags.length > 0 ? normalizedTags : undefined,
      limit,
      sortBy,
      tab: status,
      isScam: scamFilter,
    },
    {
      enabled: enabled && (projectId ? Number.isFinite(projectId) : true),
      getNextPageParam: (last) => last.nextCursor ?? undefined,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (paramsSignature !== lastParamsSignatureRef.current) {
      lastParamsSignatureRef.current = paramsSignature;
      setIsTransitioningParams(true);
    }
  }, [paramsSignature]);

  useEffect(() => {
    if (!isTransitioningParams) return;
    if (
      listQuery.status === 'error' ||
      (listQuery.isFetched && !listQuery.isFetching)
    ) {
      setIsTransitioningParams(false);
    }
  }, [
    isTransitioningParams,
    listQuery.isFetched,
    listQuery.isFetching,
    listQuery.status,
  ]);

  const threads = useMemo<ThreadListItem[]>(() => {
    if (!listQuery.data?.pages.length) {
      return [];
    }
    return listQuery.data.pages.flatMap((page) => page.items);
  }, [listQuery.data]);

  const mappedThreads = useMemo<ThreadMeta[]>(() => {
    return threads.map((thread) => mapThreadToMeta(thread));
  }, [threads]);

  const filteredThreads = useMemo<ThreadMeta[]>(() => {
    let results = mappedThreads;
    if (status === 'redressed') {
      results = results.filter(
        (thread) => thread.isScam && thread.isClaimRedressed,
      );
    }
    if (alertOnly) {
      results = results.filter(
        (thread) => thread.isScam && thread.isAlertDisplayed,
      );
    }
    // If no alert filter, but upstream still passed isScam=true, do not drop non-scam results.
    return results;
  }, [mappedThreads, status, alertOnly]);

  const displayThreads = isTransitioningParams ? [] : filteredThreads;

  const isLoading = listQuery.isLoading || isTransitioningParams;

  return {
    ...listQuery,
    isLoading,
    isTransitioningParams,
    threads: displayThreads,
    rawThreads: threads,
  };
};
