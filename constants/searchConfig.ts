/**
 * Configuration constants for search functionality
 */
export const SEARCH_CONFIG = {
  // Debounce settings
  DEBOUNCE_MS: 300,

  // Query constraints
  MIN_QUERY_LENGTH: 1,
  MAX_QUERY_LENGTH: 100,

  // Result limits
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,

  // Display settings
  MAX_DISPLAYED_TAGS: 3,
  MAX_DISPLAYED_TAGS_IN_MODAL: 5,

  // Highlight styling
  HIGHLIGHT_CLASS: 'bg-yellow-200 text-yellow-800 px-0.5 rounded-sm',
  TAG_HIGHLIGHT_CLASS:
    'bg-yellow-100 text-yellow-800 font-medium border border-yellow-200',
  TAG_NORMAL_CLASS: 'bg-gray-100 text-gray-700 border border-gray-200',

  // Cache settings
  SEARCH_STALE_TIME: 60000, // 1 minute
  SEARCH_CACHE_TIME: 300000, // 5 minutes

  // Performance
  MAX_CONCURRENT_SEARCHES: 3,
  SEARCH_TIMEOUT_MS: 5000,

  // UI Messages
  MESSAGES: {
    NO_RESULTS: 'No projects found',
    SEARCH_ERROR: 'Search failed. Please try again.',
    LOADING: 'Searching...',
    EMPTY_QUERY: 'Type to search projects by name or tags',
    MIN_QUERY_WARNING: `Please enter at least ${1} character`,
  },
} as const;

/**
 * Search result types
 */
export enum SearchResultType {
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
}

/**
 * Search match types for tracking
 */
export enum SearchMatchType {
  NAME = 'name',
  TAG = 'tag',
  BOTH = 'both',
}

/**
 * Get the appropriate message for search state
 */
export function getSearchMessage(
  query: string,
  isLoading: boolean,
  hasResults: boolean,
  error: any,
): string {
  if (error) {
    return SEARCH_CONFIG.MESSAGES.SEARCH_ERROR;
  }

  if (isLoading) {
    return SEARCH_CONFIG.MESSAGES.LOADING;
  }

  if (!query || query.length === 0) {
    return SEARCH_CONFIG.MESSAGES.EMPTY_QUERY;
  }

  if (query.length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
    return SEARCH_CONFIG.MESSAGES.MIN_QUERY_WARNING;
  }

  if (!hasResults) {
    return SEARCH_CONFIG.MESSAGES.NO_RESULTS;
  }

  return '';
}
