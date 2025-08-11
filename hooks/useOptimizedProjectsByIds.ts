import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';

interface UseOptimizedProjectsByIdsOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  debounceDelay?: number;
  maxBatchSize?: number;
}

interface BatchRequest {
  ids: number[];
  timestamp: number;
}

/**
 * Optimized hook for batch fetching projects with debouncing and batching
 * Reduces API calls by combining multiple requests and implementing smart caching
 */
export const useOptimizedProjectsByIds = (
  ids: (string | number)[] | undefined,
  options: UseOptimizedProjectsByIdsOptions = {},
) => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    gcTime = 30 * 60 * 1000, // 30 minutes (garbage collection time)
    debounceDelay = 300, // 300ms debounce
    maxBatchSize = 100, // Max 100 IDs per request (API limit)
  } = options;

  // Local cache for projects
  const projectCacheRef = useRef<
    Map<number, { project: IProject; timestamp: number }>
  >(new Map());
  const [localProjects, setLocalProjects] = useState<IProject[]>([]);
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  // Process and deduplicate IDs
  const uniqueIds = useMemo(() => {
    if (!ids || ids.length === 0) return [];

    const numberIds = ids
      .map((id) => {
        const num = typeof id === 'string' ? parseInt(id, 10) : id;
        return isNaN(num) ? null : num;
      })
      .filter((id): id is number => id !== null);

    return [...new Set(numberIds)];
  }, [ids]);

  // Debounce the IDs to reduce API calls
  const [debouncedIds] = useDebounce(uniqueIds, debounceDelay);

  // Check which IDs need to be fetched (not in cache or stale)
  const idsToFetch = useMemo(() => {
    const now = Date.now();
    return debouncedIds.filter((id) => {
      const cached = projectCacheRef.current.get(id);
      if (!cached) return true;
      // Check if cache is stale
      return now - cached.timestamp > staleTime;
    });
  }, [debouncedIds, staleTime]);

  // Batch the IDs if they exceed maxBatchSize
  const batchedIds = useMemo(() => {
    const batches: number[][] = [];
    for (let i = 0; i < idsToFetch.length; i += maxBatchSize) {
      batches.push(idsToFetch.slice(i, i + maxBatchSize));
    }
    return batches;
  }, [idsToFetch, maxBatchSize]);

  // Fetch projects for IDs not in cache
  const {
    data: fetchedProjects,
    isLoading: isFetching,
    error,
  } = trpc.project.getProjectByIds.useQuery(
    { ids: idsToFetch },
    {
      enabled:
        enabled && idsToFetch.length > 0 && idsToFetch.length <= maxBatchSize,
      staleTime,
      gcTime,
    },
  );

  // Get tRPC utils for fetch
  const utils = trpc.useUtils();

  // Batch fetch for large ID sets
  const fetchBatches = useCallback(async () => {
    if (batchedIds.length <= 1) return;

    setIsLocalLoading(true);
    try {
      const results = await Promise.all(
        batchedIds.map((batch) =>
          utils.project.getProjectByIds.fetch({ ids: batch }),
        ),
      );

      const allProjects = results.flat();
      const now = Date.now();

      // Update cache
      allProjects.forEach((project: any) => {
        projectCacheRef.current.set(project.id, {
          project: project as IProject,
          timestamp: now,
        });
      });

      setLocalProjects(allProjects as IProject[]);
    } catch (err) {
      console.error('Batch fetch error:', err);
    } finally {
      setIsLocalLoading(false);
    }
  }, [batchedIds, utils]);

  // Execute batch fetch when needed
  useEffect(() => {
    if (batchedIds.length > 1 && enabled) {
      fetchBatches();
    }
  }, [batchedIds.length, fetchBatches, enabled]);

  // Update cache when data is fetched
  useEffect(() => {
    if (fetchedProjects) {
      const now = Date.now();
      fetchedProjects.forEach((project) => {
        projectCacheRef.current.set(project.id, {
          project: project as IProject,
          timestamp: now,
        });
      });
    }
  }, [fetchedProjects]);

  // Get all requested projects from cache
  const projects = useMemo(() => {
    const result: IProject[] = [];
    const now = Date.now();

    debouncedIds.forEach((id) => {
      const cached = projectCacheRef.current.get(id);
      if (cached && now - cached.timestamp <= staleTime) {
        result.push(cached.project);
      }
    });

    // Add newly fetched projects if not in result
    if (fetchedProjects) {
      fetchedProjects.forEach((project) => {
        if (!result.find((p) => p.id === project.id)) {
          result.push(project as IProject);
        }
      });
    }

    // Add batch fetched projects if not in result
    localProjects.forEach((project) => {
      if (!result.find((p) => p.id === project.id)) {
        result.push(project);
      }
    });

    return result;
  }, [debouncedIds, fetchedProjects, localProjects, staleTime]);

  // Create a map for quick lookup
  const projectsMap = useMemo(() => {
    const map = new Map<number, IProject>();
    projects.forEach((project) => {
      map.set(project.id, project);
    });
    return map;
  }, [projects]);

  const isLoading = isFetching || isLocalLoading;

  return {
    projects,
    isLoading,
    error: error as Error | null,
    projectsMap,
    cachedCount: projectCacheRef.current.size,
    idsToFetch: idsToFetch.length,
  };
};

/**
 * Preload projects into cache for future use
 * Useful for warming up the cache with frequently accessed projects
 */
export const usePreloadProjects = (
  ids: number[],
  options: Omit<UseOptimizedProjectsByIdsOptions, 'enabled'> = {},
) => {
  const { staleTime = 5 * 60 * 1000, gcTime = 30 * 60 * 1000 } = options;

  const preload = trpc.project.getProjectByIds.useQuery(
    { ids },
    {
      enabled: ids.length > 0,
      staleTime,
      gcTime,
    },
  );

  return preload;
};

/**
 * Hook to manage project cache across the application
 * Provides utilities to clear, refresh, and inspect cache
 */
export const useProjectCacheManager = () => {
  const utils = trpc.useUtils();

  const clearCache = useCallback(() => {
    utils.project.getProjectByIds.invalidate();
  }, [utils]);

  const refreshProjects = useCallback(
    (ids: number[]) => {
      return utils.project.getProjectByIds.fetch({ ids });
    },
    [utils],
  );

  const getCachedProjects = useCallback(
    (ids: number[]) => {
      return utils.project.getProjectByIds.getData({ ids });
    },
    [utils],
  );

  return {
    clearCache,
    refreshProjects,
    getCachedProjects,
  };
};
