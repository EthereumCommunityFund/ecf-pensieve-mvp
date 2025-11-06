import type { SerializedAdvancedFilterCard } from '@/components/pages/project/customFilters/types';

export interface StoredSieveFilterMetadata {
  createdAt: string;
  updatedAt: string;
}

export interface StoredSieveFilterConditions {
  version: number;
  basePath: string;
  sort: string | null;
  categories: string[];
  search: string | null;
  advancedFilters: SerializedAdvancedFilterCard[];
  metadata: StoredSieveFilterMetadata;
}

export interface ResolvedSieveFilterState {
  targetPath: string;
  conditions: StoredSieveFilterConditions;
}
