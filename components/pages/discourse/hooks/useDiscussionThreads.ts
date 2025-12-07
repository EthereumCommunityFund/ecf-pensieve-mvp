import { useMemo } from 'react';

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
};

export const useDiscussionThreads = ({
  projectId,
  categories = [],
  tags = [],
  limit = 20,
  enabled = true,
  sort = 'new',
  status = 'all',
}: UseDiscussionThreadsParams) => {
  const normalizedCategories = categories.filter(Boolean);
  const normalizedTags = tags.filter(Boolean);
  const sortBy = sort === 'top' ? 'votes' : 'recent';

  const listQuery = trpc.projectDiscussionThread.listThreads.useInfiniteQuery(
    {
      projectId,
      category:
        normalizedCategories.length > 0 ? normalizedCategories : undefined,
      tags: normalizedTags.length > 0 ? normalizedTags : undefined,
      limit,
      sortBy,
      tab: status,
    },
    {
      enabled: enabled && (projectId ? Number.isFinite(projectId) : true),
      getNextPageParam: (last) => last.nextCursor ?? undefined,
      refetchOnWindowFocus: false,
    },
  );

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
    if (status === 'redressed') {
      return mappedThreads.filter(
        (thread) => thread.isScam && thread.isClaimRedressed,
      );
    }
    return mappedThreads;
  }, [mappedThreads, status]);

  return {
    ...listQuery,
    threads: filteredThreads,
    rawThreads: threads,
  };
};
