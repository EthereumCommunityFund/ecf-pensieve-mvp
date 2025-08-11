import { useMemo } from 'react';

import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';

/**
 * Extract project name from project data with fallback logic
 * This follows the same logic as useProjectItemValue hook
 * 1. First check projectSnap data
 * 2. Then check direct project properties
 * 3. Return fallback if not found
 */
const getProjectName = (project: IProject): string => {
  // Try to get name from projectSnap first
  if (project.projectSnap?.items) {
    const nameItem = project.projectSnap.items.find(
      (item) => item.key === 'name',
    );
    if (nameItem?.value) {
      return nameItem.value as string;
    }
  }

  // Fallback to project.name if available
  if ('name' in project && (project as any).name) {
    return (project as any).name;
  }

  // Final fallback to "Project {id}"
  return `Project ${project.id}`;
};

interface UseProjectsByIdsOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

interface UseProjectsByIdsResult {
  projects: IProject[] | undefined;
  isLoading: boolean;
  error: Error | null;
  projectsMap: Map<number, IProject>;
}

/**
 * Hook to batch fetch project information by IDs
 * Automatically deduplicates IDs and provides caching
 *
 * @param ids - Array of project IDs (as strings or numbers)
 * @param options - Query options
 * @returns Object containing projects array, loading state, error, and projects map
 */
export const useProjectsByIds = (
  ids: (string | number)[] | undefined,
  options: UseProjectsByIdsOptions = {},
): UseProjectsByIdsResult => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    gcTime = 30 * 60 * 1000, // 30 minutes (garbage collection time)
  } = options;

  // Process and deduplicate IDs
  const uniqueIds = useMemo(() => {
    if (!ids || ids.length === 0) return [];

    // Convert to numbers and filter out invalid IDs
    const numberIds = ids
      .map((id) => {
        const num = typeof id === 'string' ? parseInt(id, 10) : id;
        return isNaN(num) ? null : num;
      })
      .filter((id): id is number => id !== null);

    // Deduplicate
    return [...new Set(numberIds)];
  }, [ids]);

  // Fetch projects using tRPC
  const {
    data: projects,
    isLoading,
    error,
  } = trpc.project.getProjectByIds.useQuery(
    { ids: uniqueIds },
    {
      enabled: enabled && uniqueIds.length > 0,
      staleTime,
      gcTime,
    },
  );

  // Create a map for quick lookup
  const projectsMap = useMemo(() => {
    const map = new Map<number, IProject>();
    if (projects) {
      projects.forEach((project) => {
        map.set(project.id, project as IProject);
      });
    }
    return map;
  }, [projects]);

  return {
    projects: projects as IProject[] | undefined,
    isLoading,
    error: error as Error | null,
    projectsMap,
  };
};

/**
 * Hook to get a single project by ID
 * Uses the batch fetching hook internally for consistency
 *
 * @param id - Project ID (string or number)
 * @param options - Query options
 * @returns Object containing project, loading state, and error
 */
export const useProjectById = (
  id: string | number | undefined,
  options: UseProjectsByIdsOptions = {},
) => {
  const ids = useMemo(() => (id ? [id] : []), [id]);
  const { projects, isLoading, error } = useProjectsByIds(ids, options);

  return {
    project: projects?.[0],
    isLoading,
    error,
  };
};

/**
 * Hook to get project names by IDs
 * Useful for displaying project names in multi-select fields
 *
 * @param ids - Array of project IDs
 * @param options - Query options
 * @returns Object containing projects with names, loading state, and name map
 */
export const useProjectNamesByIds = (
  ids: (string | number)[] | undefined,
  options: UseProjectsByIdsOptions = {},
) => {
  const { projects, isLoading, error, projectsMap } = useProjectsByIds(
    ids,
    options,
  );

  // Extract project names using the same logic as useProjectItemValue
  const projectNamesMap = useMemo(() => {
    const namesMap = new Map<number, string>();

    projects?.forEach((project) => {
      const projectName = getProjectName(project);
      namesMap.set(project.id, projectName);
    });

    return namesMap;
  }, [projects]);

  return {
    projects,
    projectNamesMap,
    isLoading,
    error,
    projectsMap,
  };
};
