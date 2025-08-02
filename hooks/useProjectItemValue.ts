import { useCallback, useMemo } from 'react';

import { IProject } from '@/types';
import { IEssentialItemKey } from '@/types/item';

/**
 * Hook for retrieving project item values with projectSnap fallback
 * @param project - The project object containing item data and projectSnap
 * @returns Object containing the getItemValue function and common values
 */
export const useProjectItemValue = (project: IProject | null | undefined) => {
  // Process projectSnap data into a map for efficient lookup
  const projectSnapDataMap = useMemo(() => {
    if (
      !project?.projectSnap?.items ||
      project.projectSnap.items.length === 0
    ) {
      return {} as Record<IEssentialItemKey, any>;
    }

    return project.projectSnap.items.reduce(
      (prev, cur) => ({
        ...prev,
        [cur.key]: cur.value,
      }),
      {} as Record<IEssentialItemKey, any>,
    );
  }, [project]);

  /**
   * Get item value with fallback logic:
   * 1. First check projectSnap data
   * 2. Then check direct project properties
   * 3. Return empty string if not found
   */
  const getItemValue = useCallback(
    (itemKey: IEssentialItemKey) => {
      if (!project) return '';
      return projectSnapDataMap[itemKey] || project[itemKey] || '';
    },
    [projectSnapDataMap, project],
  );

  // Common values extracted for convenience
  const logoUrl = useMemo(() => getItemValue('logoUrl'), [getItemValue]);
  const projectName = useMemo(() => getItemValue('name'), [getItemValue]);
  const tagline = useMemo(() => getItemValue('tagline'), [getItemValue]);

  // Parse categories array
  const categories = useMemo(() => {
    const cats = getItemValue('categories');
    if (typeof cats === 'string') {
      try {
        const parsed = JSON.parse(cats);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return Array.isArray(cats) ? cats : [];
  }, [getItemValue]);

  return {
    getItemValue,
    projectSnapDataMap,
    // Common values
    logoUrl,
    projectName,
    tagline,
    categories,
  };
};
