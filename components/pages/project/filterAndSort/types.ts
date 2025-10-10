export interface FilterState {
  categories: string[];
  locations: string[];
  tags: string[]; // Reserved for future
}

export type FilterSection = 'categories' | 'locations' | 'tags';

export interface SortOption {
  value: string;
  label: string;
  category: string;
}

export const SORT_OPTIONS: SortOption[] = [
  // By Rank
  { value: 'top-transparent', label: 'Top Transparent', category: 'By Rank' },
  {
    value: 'top-community-trusted',
    label: 'Top Community Trusted',
    category: 'By Rank',
  },
  {
    value: 'top-accountable',
    label: 'Top Accountable',
    category: 'By Rank',
  },
  // By Time
  { value: 'newest', label: 'Newest Projects', category: 'By Time' },
  { value: 'oldest', label: 'Oldest Projects', category: 'By Time' },
  // By Name
  { value: 'a-z', label: 'Order Alphabetically (A→Z)', category: 'By Name' },
  { value: 'z-a', label: 'Order Alphabetically (Z→A)', category: 'By Name' },
  // By Activity
  {
    value: 'most-contributed',
    label: 'Most Contributed',
    category: 'By Activity',
  },
  {
    value: 'less-contributed',
    label: 'Less Contributed',
    category: 'By Activity',
  },
];

export const CATEGORY_MAP: Record<string, string> = {
  'By Rank': 'By Rank:',
  'By Time': 'By Time:',
  'By Name': 'By Name:',
  'By Activity': 'By Activity:',
};

export const INITIAL_ITEMS_COUNT = 5;
