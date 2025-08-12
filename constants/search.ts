export const SEARCH_CONFIG = {
  // Query constraints
  MIN_QUERY_LENGTH: 1,
  MAX_QUERY_LENGTH: 100,
  MIN_SEARCH_CHARS: 2, // Minimum characters to trigger search

  // Pagination
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,

  // Cache
  SEARCH_STALE_TIME: 1000 * 60 * 5, // 5 minutes

  // Debounce
  DEBOUNCE_DELAY: 300,

  // Messages
  MESSAGES: {
    EMPTY_QUERY: 'Please enter at least 2 characters to search',
    QUERY_TOO_SHORT: 'Search query cannot be empty',
    QUERY_TOO_LONG: 'Search query too long (max 100 characters)',
    NO_RESULTS: 'No results found',
    ERROR: 'Failed to search projects',
  },

  // Storage
  STORAGE_KEYS: {
    SEARCH_HISTORY: 'searchHistory',
  },
  MAX_HISTORY_ITEMS: 10,
} as const;
