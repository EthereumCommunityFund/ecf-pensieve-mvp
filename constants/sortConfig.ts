import { SortBy } from '@/types/sort';

/**
 * Available sort types for project lists
 * Uses backend SortBy enum values
 */
export const SORT_TYPES = {
  TRANSPARENT: SortBy.TRANSPARENT,
  COMMUNITY_TRUSTED: SortBy.COMMUNITY_TRUSTED,
} as const;

export type SortType = (typeof SORT_TYPES)[keyof typeof SORT_TYPES];

/**
 * Display labels for sort types
 */
export const SORT_LABELS: Record<SortType, string> = {
  [SortBy.TRANSPARENT]: 'Transparent',
  [SortBy.COMMUNITY_TRUSTED]: 'Community Trusted',
};

/**
 * Default sort type for project lists
 */
export const DEFAULT_SORT_TYPE = SORT_TYPES.TRANSPARENT;

/**
 * Get sort tabs configuration
 */
export const getSortTabs = () => [
  { key: SORT_TYPES.TRANSPARENT, label: SORT_LABELS[SORT_TYPES.TRANSPARENT] },
  {
    key: SORT_TYPES.COMMUNITY_TRUSTED,
    label: SORT_LABELS[SORT_TYPES.COMMUNITY_TRUSTED],
  },
];
