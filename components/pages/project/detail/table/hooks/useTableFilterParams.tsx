'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface FilterParams {
  showPendingOnly: boolean;
  showEmptyOnly: boolean;
  showMetrics: boolean;
  collapsed: boolean;
}

/**
 * Hook for managing filter state persistence via URL parameters
 */
export const useTableFilterParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse filter params from URL
  const getFilterParams = useCallback((): FilterParams => {
    return {
      showPendingOnly: searchParams.get('pendingOnly') === 'true',
      showEmptyOnly: searchParams.get('emptyOnly') === 'true',
      showMetrics: searchParams.get('showMetrics') === 'true',
      collapsed: searchParams.get('collapsed') === 'true',
    };
  }, [searchParams]);

  // Update URL with filter params
  const setFilterParams = useCallback(
    (params: Partial<FilterParams>) => {
      const current = new URLSearchParams(searchParams.toString());

      // Update or remove parameters based on their values
      Object.entries(params).forEach(([key, value]) => {
        const paramKey =
          key === 'showPendingOnly'
            ? 'pendingOnly'
            : key === 'showEmptyOnly'
              ? 'emptyOnly'
              : key === 'showMetrics'
                ? 'showMetrics'
                : 'collapsed';

        if (value === true) {
          current.set(paramKey, 'true');
        } else if (value === false) {
          current.delete(paramKey);
        }
      });

      // Only update if URL would change
      const newSearch = current.toString();
      const currentSearch = searchParams.toString();

      if (newSearch !== currentSearch) {
        const url = newSearch ? `${pathname}?${newSearch}` : pathname;
        router.replace(url, { scroll: false });
      }
    },
    [pathname, router, searchParams],
  );

  // Clear all filter params
  const clearFilterParams = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return {
    filterParams: getFilterParams(),
    setFilterParams,
    clearFilterParams,
  };
};
