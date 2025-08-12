'use client';

import { type ReactNode, useCallback, useMemo, useState } from 'react';

import { SEARCH_CONFIG } from '@/constants/search';
import useDebounce from '@/hooks/useDebounce';
import { trpc } from '@/lib/trpc/client';
import { highlightSearchText } from '@/utils/searchHighlight';

/**
 * Options for the useProjectSearch hook
 */
export interface UseProjectSearchOptions {
  enabled?: boolean;
  limit?: number;
  debounceMs?: number;
  onSearch?: (query: string) => void;
}

/**
 * Result of the useProjectSearch hook
 */
export interface UseProjectSearchResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedQuery: string;
  searchResults: any;
  isLoading: boolean;
  isFetching: boolean;
  error: any;
  highlightText: (text: string, query?: string) => ReactNode[];
  clearSearch: () => void;
}

/**
 * Unified hook for project search functionality
 * Provides search state management, debouncing, and text highlighting
 */
export function useProjectSearch(
  options: UseProjectSearchOptions = {},
): UseProjectSearchResult {
  const {
    enabled = true,
    limit = SEARCH_CONFIG.DEFAULT_LIMIT,
    debounceMs = SEARCH_CONFIG.DEBOUNCE_DELAY,
    onSearch,
  } = options;

  // Search state
  const [searchQuery, setSearchQueryInternal] = useState('');

  // Debounced search query
  const debouncedQuery = useDebounce(searchQuery, debounceMs);

  // Truncate query if too long
  const truncatedQuery = debouncedQuery
    ? debouncedQuery.slice(0, SEARCH_CONFIG.MAX_QUERY_LENGTH)
    : '';

  // Search API call
  const {
    data: searchResults,
    isLoading,
    isFetching,
    error,
  } = trpc.project.searchProjects.useQuery(
    {
      query: truncatedQuery,
      limit,
    },
    {
      enabled:
        enabled &&
        !!truncatedQuery &&
        truncatedQuery.length >= SEARCH_CONFIG.MIN_QUERY_LENGTH,
      staleTime: SEARCH_CONFIG.SEARCH_STALE_TIME,
    },
  );

  // Handle search query change
  const setSearchQuery = useCallback(
    (query: string) => {
      setSearchQueryInternal(query);
      if (onSearch) {
        onSearch(query);
      }
    },
    [onSearch],
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

  // Highlight text helper
  const highlightText = useCallback(
    (text: string, query?: string) => {
      const searchTerm = query || debouncedQuery || '';
      return highlightSearchText(text, searchTerm);
    },
    [debouncedQuery],
  );

  // Memoized result
  const result = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      debouncedQuery: debouncedQuery || '',
      searchResults,
      isLoading,
      isFetching,
      error,
      highlightText,
      clearSearch,
    }),
    [
      searchQuery,
      setSearchQuery,
      debouncedQuery,
      searchResults,
      isLoading,
      isFetching,
      error,
      highlightText,
      clearSearch,
    ],
  );

  return result;
}

/**
 * Hook for using just the highlighting functionality
 */
export function useSearchHighlight() {
  const highlightText = useCallback((text: string, query: string) => {
    return highlightSearchText(text, query);
  }, []);

  return { highlightText };
}
