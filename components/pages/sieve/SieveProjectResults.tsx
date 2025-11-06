'use client';

import { useEffect, useMemo, useState } from 'react';

import { filterProjectsByAdvancedFilters } from '@/components/pages/project/customFilters/utils';
import { ProjectListWrapper } from '@/components/pages/project/ProjectListWrapper';
import { ADVANCED_FILTER_FETCH_LIMIT } from '@/constants/projectFilters';
import {
  buildTargetPathFromConditions,
  getAdvancedFilterCardsFromConditions,
} from '@/lib/services/sieveFilterService';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';
import type { StoredSieveFilterConditions } from '@/types/sieve';
import { SortBy, SortOrder } from '@/types/sort';

const PAGE_SIZE = 10;

interface SieveProjectResultsProps {
  conditions: StoredSieveFilterConditions;
  mode: 'management' | 'public';
}

type SortParams =
  | {
      sortBy: SortBy;
      sortOrder: SortOrder;
    }
  | Record<string, never>;

const mapSortToParams = (sortValue: string | null): SortParams => {
  switch (sortValue) {
    case 'newest':
      return { sortBy: SortBy.CREATED_AT, sortOrder: SortOrder.DESC };
    case 'oldest':
      return { sortBy: SortBy.CREATED_AT, sortOrder: SortOrder.ASC };
    case 'a-z':
      return { sortBy: SortBy.NAME, sortOrder: SortOrder.ASC };
    case 'z-a':
      return { sortBy: SortBy.NAME, sortOrder: SortOrder.DESC };
    case 'most-contributed':
      return { sortBy: SortBy.ACTIVITY, sortOrder: SortOrder.DESC };
    case 'less-contributed':
      return { sortBy: SortBy.ACTIVITY, sortOrder: SortOrder.ASC };
    case 'top-transparent':
      return { sortBy: SortBy.TRANSPARENT, sortOrder: SortOrder.DESC };
    case 'top-community-trusted':
      return { sortBy: SortBy.COMMUNITY_TRUSTED, sortOrder: SortOrder.DESC };
    case 'top-accountable':
      return { sortBy: SortBy.TRANSPARENT, sortOrder: SortOrder.DESC };
    default:
      return {};
  }
};

const buildConditionsKey = (conditions: StoredSieveFilterConditions): string =>
  JSON.stringify({
    sort: conditions.sort,
    categories: conditions.categories,
    search: conditions.search,
    advanced: conditions.advancedFilters,
  });

const dedupeProjects = (projects: IProject[]): IProject[] => {
  const seen = new Set<number>();
  const result: IProject[] = [];
  for (const project of projects) {
    if (seen.has(project.id)) {
      continue;
    }
    seen.add(project.id);
    result.push(project);
  }
  return result;
};

const SieveProjectResults = ({
  conditions,
  mode,
}: SieveProjectResultsProps) => {
  const [offset, setOffset] = useState(0);
  const [rawProjects, setRawProjects] = useState<IProject[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const advancedFilters = useMemo(
    () => getAdvancedFilterCardsFromConditions(conditions),
    [conditions],
  );

  const shouldUseAdvancedFilter = advancedFilters.length > 0;
  const fetchLimit = shouldUseAdvancedFilter
    ? ADVANCED_FILTER_FETCH_LIMIT
    : PAGE_SIZE;
  const sortParams = useMemo(
    () => mapSortToParams(conditions.sort ?? null),
    [conditions.sort],
  );

  const searchTerm = useMemo(() => {
    return conditions.search?.trim().toLowerCase() ?? null;
  }, [conditions.search]);

  const categories = conditions.categories ?? [];
  const conditionsKey = useMemo(
    () => buildConditionsKey(conditions),
    [conditions],
  );

  useEffect(() => {
    setOffset(0);
    setRawProjects([]);
    setHasNextPage(true);
    setIsFetchingMore(false);
  }, [conditionsKey]);

  const projectQuery = trpc.project.getProjects.useQuery(
    {
      limit: fetchLimit,
      offset,
      isPublished: true,
      ...(categories.length > 0 ? { categories } : {}),
      ...(sortParams as object),
    },
    {
      keepPreviousData: true,
    },
  );

  useEffect(() => {
    if (!projectQuery.data) {
      return;
    }

    const incoming = (projectQuery.data.items ?? []) as IProject[];
    setRawProjects((prev) => {
      if (offset === 0) {
        return dedupeProjects(incoming);
      }

      const merged = [...prev, ...incoming];
      return dedupeProjects(merged);
    });

    setHasNextPage(Boolean(projectQuery.data.hasNextPage));
    setIsFetchingMore(false);
  }, [projectQuery.data, offset]);

  const filteredProjects = useMemo(() => {
    let items = rawProjects;
    if (shouldUseAdvancedFilter) {
      items = filterProjectsByAdvancedFilters(items, advancedFilters);
    }

    if (searchTerm) {
      items = items.filter((project) => {
        const name = project.name?.toLowerCase() ?? '';
        const tagline = project.tagline?.toLowerCase() ?? '';
        return name.includes(searchTerm) || tagline.includes(searchTerm);
      });
    }

    return items;
  }, [rawProjects, shouldUseAdvancedFilter, advancedFilters, searchTerm]);

  const handleLoadMore = () => {
    if (!hasNextPage || isFetchingMore || projectQuery.isFetching) {
      return;
    }

    setIsFetchingMore(true);
    setOffset((prev) => prev + fetchLimit);
  };

  const viewAllUrl = useMemo(
    () => buildTargetPathFromConditions(conditions),
    [conditions],
  );

  const isInitialLoading = projectQuery.isLoading && offset === 0;

  return (
    <ProjectListWrapper
      isLoading={isInitialLoading}
      isFetchingNextPage={isFetchingMore}
      hasNextPage={hasNextPage}
      projectList={filteredProjects}
      emptyMessage="No projects match this feed yet."
      onLoadMore={handleLoadMore}
      onSuccess={() => {
        projectQuery.refetch();
      }}
      showCreator={mode === 'public'}
      viewAllUrl={viewAllUrl}
      viewAllText="Open in Projects"
    />
  );
};

export default SieveProjectResults;
