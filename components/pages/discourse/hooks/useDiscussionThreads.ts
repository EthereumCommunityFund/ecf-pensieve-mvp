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
};

export const useDiscussionThreads = ({
  projectId,
  categories = [],
  tags = [],
  limit = 20,
  enabled = true,
}: UseDiscussionThreadsParams) => {
  const normalizedCategories = categories.filter(Boolean);
  const normalizedTags = tags.filter(Boolean);

  const listQuery = trpc.projectDiscussionThread.listThreads.useInfiniteQuery(
    {
      projectId,
      category:
        normalizedCategories.length > 0 ? normalizedCategories : undefined,
      tags: normalizedTags.length > 0 ? normalizedTags : undefined,
      limit,
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

  return {
    ...listQuery,
    threads: mappedThreads,
    rawThreads: threads,
  };
};
