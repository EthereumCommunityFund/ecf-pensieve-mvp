'use client';

import { Image } from '@heroui/react';
import { PlusCircle } from '@phosphor-icons/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import CustomFilterModal from '@/components/pages/project/customFilters/CustomFilterModal';
import CustomFilterPanel from '@/components/pages/project/customFilters/CustomFilterPanel';
import SaveFeedModal from '@/components/pages/project/customFilters/SaveFeedModal';
import {
  type AdvancedFilterCard,
  type AdvancedFilterModalState,
} from '@/components/pages/project/customFilters/types';
import {
  collectFilterFieldKeys,
  createEmptyFilter,
  filterProjectsByAdvancedFilters,
  getAdvancedFilterQueryKey,
  parseAdvancedFilters,
  serializeAdvancedFilters,
} from '@/components/pages/project/customFilters/utils';
import ProjectFilter from '@/components/pages/project/filterAndSort/Filter';
import ProjectFilterMobile from '@/components/pages/project/filterAndSort/FilterMobile';
import ProjectSort from '@/components/pages/project/filterAndSort/Sort';
import ProjectSortMobile from '@/components/pages/project/filterAndSort/SortMobile';
import { ProjectCardSkeleton } from '@/components/pages/project/ProjectCard';
import { ProjectListWrapper } from '@/components/pages/project/ProjectListWrapper';
import RewardCard from '@/components/pages/project/RewardCardEntry';
import { ADVANCED_FILTER_FETCH_LIMIT } from '@/constants/projectFilters';
import { TotalGenesisWeightSum } from '@/constants/tableConfig';
import { useAuth } from '@/context/AuthContext';
import { useExternalLink } from '@/context/ExternalLinkContext';
import { useOffsetPagination } from '@/hooks/useOffsetPagination';
import { UpvoteActionResult } from '@/hooks/useUpvote';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';
import { SortBy, SortOrder } from '@/types/sort';
import { devLog } from '@/utils/devLog';

const PAGE_SIZE = 10;
const ADVANCED_FILTER_KEY = getAdvancedFilterQueryKey();

const ProjectsContent = () => {
  const { profile, showAuthPrompt } = useAuth();
  const { openExternalLink } = useExternalLink();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString() ?? '';
  const currentTargetPath = useMemo(
    () =>
      searchParamsString ? `/projects?${searchParamsString}` : '/projects',
    [searchParamsString],
  );

  // Get filter and sort parameters from URL - memoize to prevent recreation
  const catsParam = searchParams.get('cats');
  const cats = useMemo(() => {
    return catsParam?.split(',').filter(Boolean);
  }, [catsParam]);
  const catsKey = cats?.join(',') ?? '';

  const sort = searchParams.get('sort');
  const isAccountableSort = sort === 'top-accountable';

  const advancedFilterParam = searchParams.get(ADVANCED_FILTER_KEY);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterCard[]>(
    () => parseAdvancedFilters(advancedFilterParam),
  );
  const advancedFilterSerializedRef = useRef<string | null>(
    advancedFilterParam ?? null,
  );
  const shouldLogInitialUrlFilterRef = useRef<boolean>(
    Boolean(advancedFilterParam),
  );
  const [modalState, setModalState] = useState<AdvancedFilterModalState | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [advancedFilterSourceData, setAdvancedFilterSourceData] = useState<
    IProject[]
  >([]);
  const [advancedFilterOffset, setAdvancedFilterOffset] = useState(0);
  const [isAdvancedFilterLoadingMore, setIsAdvancedFilterLoadingMore] =
    useState(false);
  const [hasAdvancedFilterNextPage, setHasAdvancedFilterNextPage] =
    useState(false);
  const [isAccountableFilterRefreshing, setIsAccountableFilterRefreshing] =
    useState(false);
  const [isSaveFeedModalOpen, setIsSaveFeedModalOpen] = useState(false);
  const trackUserAction = trpc.userActionLog.track.useMutation();

  useEffect(() => {
    if (advancedFilterParam === advancedFilterSerializedRef.current) {
      return;
    }
    const parsed = parseAdvancedFilters(advancedFilterParam);
    setAdvancedFilters(parsed);
    advancedFilterSerializedRef.current = advancedFilterParam ?? null;
  }, [advancedFilterParam]);

  const canUseAdvancedFilters = true;
  const shouldUseAdvancedFilter = advancedFilters.length > 0;
  const advancedFilterDisabledReason: string | undefined = undefined;
  const advancedFilterSignature = useMemo(
    () => JSON.stringify(advancedFilters),
    [advancedFilters],
  );
  const hasCategoryFilters = (cats?.length ?? 0) > 0;
  const hasSaveableState =
    shouldUseAdvancedFilter || hasCategoryFilters || Boolean(sort);
  const saveFeedDisabledReason = hasSaveableState
    ? undefined
    : 'Add filters or sorting to save a feed';

  const handleOpenSaveFeed = useCallback(() => {
    if (!hasSaveableState) {
      return;
    }

    if (!profile) {
      showAuthPrompt('invalidAction');
      return;
    }

    setIsSaveFeedModalOpen(true);
  }, [hasSaveableState, profile, showAuthPrompt]);

  const updateAdvancedFilters = useCallback(
    (nextFilters: AdvancedFilterCard[]) => {
      setAdvancedFilters(nextFilters);
      const params = new URLSearchParams(searchParams.toString());
      const serialized = serializeAdvancedFilters(nextFilters);

      if (serialized) {
        params.set(ADVANCED_FILTER_KEY, serialized);
      } else {
        params.delete(ADVANCED_FILTER_KEY);
      }

      const paramsString = params.toString();
      router.replace(`/projects${paramsString ? `?${paramsString}` : ''}`);
      advancedFilterSerializedRef.current = serialized ?? null;
      shouldLogInitialUrlFilterRef.current = false;
    },
    [router, searchParams],
  );

  const trackAdvancedFilterUsage = useCallback(
    (
      type: 'add filter' | 'url filter',
      filters: AdvancedFilterCard | AdvancedFilterCard[],
    ) => {
      if (!profile) {
        return;
      }

      const action = collectFilterFieldKeys(filters);
      if (!action) {
        return;
      }

      trackUserAction.mutate(
        { type, action },
        {
          onError: (error) => {
            console.error('[UserActionLog] Failed to track advanced filter', {
              type,
              action,
              error,
            });
          },
        },
      );
    },
    [profile, trackUserAction],
  );

  const clearAdvancedFilters = useCallback(() => {
    updateAdvancedFilters([]);
  }, [updateAdvancedFilters]);

  const handleCreateFilter = useCallback(() => {
    if (!canUseAdvancedFilters) {
      return;
    }
    setModalState({
      mode: 'create',
      filter: createEmptyFilter(),
    });
    setIsModalOpen(true);
  }, [canUseAdvancedFilters]);

  const handleEditFilter = useCallback(
    (id: string) => {
      const target = advancedFilters.find((filter) => filter.id === id);
      if (!target) {
        return;
      }

      setModalState({
        mode: 'edit',
        filter: target,
      });
      setIsModalOpen(true);
    },
    [advancedFilters],
  );

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setModalState(null);
  }, []);

  const handleModalSave = useCallback(
    (filter: AdvancedFilterCard) => {
      const mode = modalState?.mode ?? 'create';
      if (mode === 'edit') {
        updateAdvancedFilters(
          advancedFilters.map((item) =>
            item.id === filter.id ? filter : item,
          ),
        );
      } else {
        updateAdvancedFilters([...advancedFilters, filter]);
      }

      setIsModalOpen(false);
      setModalState(null);
      trackAdvancedFilterUsage('add filter', filter);
    },
    [
      advancedFilters,
      modalState,
      trackAdvancedFilterUsage,
      updateAdvancedFilters,
    ],
  );

  const handleRemoveFilter = useCallback(
    (id: string) => {
      const nextFilters = advancedFilters.filter((filter) => filter.id !== id);
      updateAdvancedFilters(nextFilters);
      setIsModalOpen(false);
      setModalState(null);
    },
    [advancedFilters, updateAdvancedFilters],
  );
  useEffect(() => {
    if (!shouldLogInitialUrlFilterRef.current) {
      return;
    }

    if (!profile) {
      return;
    }

    if (!advancedFilterParam) {
      shouldLogInitialUrlFilterRef.current = false;
      return;
    }

    if (advancedFilters.length === 0) {
      return;
    }

    trackAdvancedFilterUsage('url filter', advancedFilters);
    shouldLogInitialUrlFilterRef.current = false;
  }, [advancedFilterParam, advancedFilters, profile, trackAdvancedFilterUsage]);

  // Parse sort parameter into sortBy and sortOrder
  const parseSortParam = (sortParam: string) => {
    switch (sortParam) {
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
      default:
        return {};
    }
  };

  const sortParams = useMemo(() => {
    if (!sort || isAccountableSort) {
      return {};
    }

    return parseSortParam(sort);
  }, [sort, isAccountableSort]);

  const {
    offset,
    items: projectList,
    isLoadingMore,
    handleLoadMore,
    setPageData,
    reset,
  } = useOffsetPagination<IProject>({ pageSize: PAGE_SIZE });

  const effectiveLimit = shouldUseAdvancedFilter
    ? ADVANCED_FILTER_FETCH_LIMIT
    : PAGE_SIZE;
  const effectiveOffset = shouldUseAdvancedFilter
    ? advancedFilterOffset
    : offset;

  const {
    data,
    dataUpdatedAt,
    isLoading,
    isFetching,
    refetch: refetchProjects,
  } = trpc.project.getProjects.useQuery(
    {
      limit: effectiveLimit,
      offset: effectiveOffset,
      isPublished: true,
      ...(cats && cats.length > 0 && { categories: cats }),
      ...sortParams,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: 'always',
      staleTime: 0,
      gcTime: 5 * 60 * 1000, // 5 minutes
      enabled: !isAccountableSort,
    },
  );

  const accountableQueryLimit = useMemo(
    () => (shouldUseAdvancedFilter ? ADVANCED_FILTER_FETCH_LIMIT : PAGE_SIZE),
    [shouldUseAdvancedFilter],
  );

  const accountableQueryInput = useMemo(
    () => ({
      limit: accountableQueryLimit,
      ...(cats && cats.length > 0 ? { categories: cats } : {}),
    }),
    [accountableQueryLimit, cats],
  );

  const {
    data: accountableData,
    isLoading: isLoadingAccountable,
    isFetchingNextPage: isFetchingNextAccountable,
    hasNextPage: hasNextAccountable,
    fetchNextPage: fetchNextAccountable,
    refetch: refetchAccountable,
  } = trpc.rank.getTopRanksByGenesisSupportPaginated.useInfiniteQuery(
    accountableQueryInput,
    {
      getNextPageParam: (lastPage) =>
        lastPage.hasNextPage ? lastPage.nextCursor : undefined,
      refetchOnWindowFocus: false,
      refetchOnMount: 'always',
      staleTime: 0,
      enabled: isAccountableSort,
    },
  );

  useEffect(() => {
    if (!shouldUseAdvancedFilter) {
      setAdvancedFilterOffset(0);
      setAdvancedFilterSourceData([]);
      setIsAdvancedFilterLoadingMore(false);
      setHasAdvancedFilterNextPage(false);
      return;
    }

    if (isAccountableSort) {
      setAdvancedFilterOffset(0);
      setAdvancedFilterSourceData([]);
      setIsAdvancedFilterLoadingMore(false);
      setHasAdvancedFilterNextPage(false);
      return;
    }

    let cancelled = false;

    setAdvancedFilterOffset(0);
    setAdvancedFilterSourceData([]);
    setIsAdvancedFilterLoadingMore(false);
    setHasAdvancedFilterNextPage(false);

    void refetchProjects({ throwOnError: false }).then((result) => {
      if (cancelled) {
        return;
      }

      const payload = result?.data;
      const items = payload?.items as IProject[] | undefined;

      if (items && items.length > 0) {
        setAdvancedFilterSourceData(items);
        setHasAdvancedFilterNextPage(
          Boolean((payload as { hasNextPage?: boolean })?.hasNextPage),
        );
      }

      setIsAdvancedFilterLoadingMore(false);
    });

    return () => {
      cancelled = true;
    };
  }, [
    advancedFilterSignature,
    shouldUseAdvancedFilter,
    isAccountableSort,
    refetchProjects,
  ]);

  const accountableProjectList = useMemo(() => {
    if (!accountableData?.pages) {
      return [] as IProject[];
    }

    return accountableData.pages.flatMap((page) =>
      page.items.map((item) => item.project),
    ) as unknown as IProject[];
  }, [accountableData]);

  useEffect(() => {
    if (!isAccountableSort || !shouldUseAdvancedFilter) {
      return;
    }

    setAdvancedFilterSourceData([]);
    setHasAdvancedFilterNextPage(false);
    setIsAdvancedFilterLoadingMore(true);
    setIsAccountableFilterRefreshing(true);
    let cancelled = false;

    void refetchAccountable({ throwOnError: false }).finally(() => {
      if (cancelled) {
        return;
      }
      setIsAccountableFilterRefreshing(false);
      setIsAdvancedFilterLoadingMore(false);
    });

    return () => {
      cancelled = true;
    };
  }, [
    advancedFilterSignature,
    isAccountableSort,
    shouldUseAdvancedFilter,
    refetchAccountable,
  ]);

  useEffect(() => {
    if (!isAccountableSort) {
      return;
    }

    if (!shouldUseAdvancedFilter) {
      setAdvancedFilterSourceData([]);
      setHasAdvancedFilterNextPage(Boolean(hasNextAccountable));
      if (!isFetchingNextAccountable) {
        setIsAdvancedFilterLoadingMore(false);
      }
      return;
    }

    if (isAccountableFilterRefreshing) {
      return;
    }

    setAdvancedFilterSourceData(accountableProjectList);
    setHasAdvancedFilterNextPage(Boolean(hasNextAccountable));
    if (!isFetchingNextAccountable) {
      setIsAdvancedFilterLoadingMore(false);
    }
  }, [
    isAccountableSort,
    shouldUseAdvancedFilter,
    accountableProjectList,
    hasNextAccountable,
    isFetchingNextAccountable,
    isAccountableFilterRefreshing,
  ]);

  const filteredProjects = useMemo(() => {
    if (!shouldUseAdvancedFilter) {
      return projectList;
    }

    return filterProjectsByAdvancedFilters(
      advancedFilterSourceData,
      advancedFilters,
    );
  }, [
    shouldUseAdvancedFilter,
    advancedFilterSourceData,
    advancedFilters,
    projectList,
  ]);

  const displayedProjects = useMemo(() => {
    if (isAccountableSort) {
      if (shouldUseAdvancedFilter) {
        return filteredProjects;
      }
      return accountableProjectList;
    }

    if (shouldUseAdvancedFilter) {
      return filteredProjects;
    }

    return projectList;
  }, [
    isAccountableSort,
    accountableProjectList,
    shouldUseAdvancedFilter,
    filteredProjects,
    projectList,
  ]);

  const isAccountableLoadingState =
    isLoadingAccountable || isAccountableFilterRefreshing;

  const isListLoading = isAccountableSort
    ? displayedProjects.length === 0 && isAccountableLoadingState
    : shouldUseAdvancedFilter
      ? (isLoading || (isFetching && advancedFilterSourceData.length === 0)) &&
        displayedProjects.length === 0
      : (isLoading || (isFetching && offset === 0)) && projectList.length === 0;

  const isListFetchingNext = isAccountableSort
    ? shouldUseAdvancedFilter
      ? isAdvancedFilterLoadingMore || isFetchingNextAccountable
      : isFetchingNextAccountable
    : shouldUseAdvancedFilter
      ? isAdvancedFilterLoadingMore
      : isLoadingMore;

  const hasListNextPage = isAccountableSort
    ? hasNextAccountable
    : shouldUseAdvancedFilter
      ? hasAdvancedFilterNextPage
      : data?.hasNextPage;

  const handleLoadMoreAction = useCallback(() => {
    if (isAccountableSort) {
      if (!hasNextAccountable || isFetchingNextAccountable) {
        return;
      }

      if (shouldUseAdvancedFilter) {
        setIsAdvancedFilterLoadingMore(true);
      }

      void fetchNextAccountable();
      return;
    }

    if (shouldUseAdvancedFilter) {
      if (isAdvancedFilterLoadingMore || !hasAdvancedFilterNextPage) {
        return;
      }

      setIsAdvancedFilterLoadingMore(true);
      setAdvancedFilterOffset((prev) => prev + ADVANCED_FILTER_FETCH_LIMIT);
      return;
    }

    handleLoadMore();
  }, [
    isAccountableSort,
    shouldUseAdvancedFilter,
    hasNextAccountable,
    isFetchingNextAccountable,
    fetchNextAccountable,
    isAdvancedFilterLoadingMore,
    hasAdvancedFilterNextPage,
    setAdvancedFilterOffset,
    handleLoadMore,
  ]);

  const handleProposeProject = useCallback(() => {
    if (!profile) {
      showAuthPrompt();
      return;
    }
    router.push('/project/create');
  }, [profile, showAuthPrompt, router]);

  const handleUpvoteSuccess = useCallback(
    (result: UpvoteActionResult) => {
      if (sort === 'top-accountable') {
        refetchAccountable();
        return;
      }

      const { projectId, previousWeight, newWeight } = result;
      const weightDelta = newWeight - previousWeight;

      const workingList = shouldUseAdvancedFilter
        ? advancedFilterSourceData
        : projectList;

      const currentProject = workingList.find(
        (project) => project.id === projectId,
      );

      if (!currentProject) {
        reset({ soft: true });
        return;
      }

      if (shouldUseAdvancedFilter) {
        void refetchProjects();
        return;
      }

      if (sort === 'top-community-trusted') {
        const currentSupport = currentProject.support || 0;
        const newSupport = currentSupport + weightDelta;

        if (weightDelta !== 0) {
          const pageStart = Math.floor(offset / PAGE_SIZE) * PAGE_SIZE;
          const pageEnd = pageStart + PAGE_SIZE - 1;

          const previousBoundarySupport =
            pageStart > 0
              ? (projectList[pageStart - 1]?.support ??
                Number.POSITIVE_INFINITY)
              : undefined;
          const nextBoundarySupport =
            projectList.length > pageEnd + 1
              ? (projectList[pageEnd + 1]?.support ?? Number.NEGATIVE_INFINITY)
              : undefined;

          const shouldMoveUp =
            weightDelta > 0 &&
            typeof previousBoundarySupport === 'number' &&
            newSupport > previousBoundarySupport;

          const shouldMoveDown =
            weightDelta < 0 &&
            typeof nextBoundarySupport === 'number' &&
            newSupport < nextBoundarySupport;

          if (shouldMoveUp || shouldMoveDown) {
            reset({ soft: true });
            return;
          }
        }
      }

      refetchProjects();
    },
    [
      projectList,
      advancedFilterSourceData,
      shouldUseAdvancedFilter,
      reset,
      sort,
      offset,
      refetchProjects,
      refetchAccountable,
    ],
  );

  // Manage accumulated projects list
  useEffect(() => {
    if (!data?.items) {
      return;
    }

    if (shouldUseAdvancedFilter) {
      if (
        typeof data.offset === 'number' &&
        data.offset !== advancedFilterOffset
      ) {
        return;
      }

      const incomingItems = data.items as IProject[];
      setAdvancedFilterSourceData((prev) => {
        if (advancedFilterOffset === 0 || prev.length === 0) {
          return incomingItems;
        }

        const existingIds = new Set(prev.map((item) => item.id));
        const merged = [...prev];

        for (const item of incomingItems) {
          if (!existingIds.has(item.id)) {
            merged.push(item);
          }
        }

        return merged;
      });

      setHasAdvancedFilterNextPage(
        Boolean((data as { hasNextPage?: boolean }).hasNextPage),
      );
      setIsAdvancedFilterLoadingMore(false);
      return;
    }

    if (typeof data.offset === 'number' && data.offset !== offset) {
      return;
    }

    setAdvancedFilterSourceData([]);
    setHasAdvancedFilterNextPage(false);
    setIsAdvancedFilterLoadingMore(false);
    setPageData(data.items as IProject[], data.offset ?? offset);
  }, [
    data,
    dataUpdatedAt,
    offset,
    setPageData,
    shouldUseAdvancedFilter,
    advancedFilterOffset,
  ]);

  useEffect(() => {
    if (
      !shouldUseAdvancedFilter ||
      isAccountableSort ||
      !hasAdvancedFilterNextPage ||
      isAdvancedFilterLoadingMore ||
      isFetching ||
      isLoading
    ) {
      return;
    }

    setIsAdvancedFilterLoadingMore(true);
    setAdvancedFilterOffset((prev) => prev + ADVANCED_FILTER_FETCH_LIMIT);
  }, [
    shouldUseAdvancedFilter,
    isAccountableSort,
    hasAdvancedFilterNextPage,
    isAdvancedFilterLoadingMore,
    isFetching,
    isLoading,
    setAdvancedFilterOffset,
  ]);

  // Reset when filters (cats) or sort change. Also trigger a refetch to avoid stale UI
  useEffect(() => {
    reset();
    if (shouldUseAdvancedFilter) {
      setAdvancedFilterOffset(0);
      setAdvancedFilterSourceData([]);
      setIsAdvancedFilterLoadingMore(false);
      setHasAdvancedFilterNextPage(false);
    }
  }, [sort, catsKey, advancedFilterSignature, reset, shouldUseAdvancedFilter]);

  useEffect(() => {
    if (!shouldUseAdvancedFilter) {
      return;
    }

    if (isAccountableSort) {
      if (!isFetchingNextAccountable) {
        setIsAdvancedFilterLoadingMore(false);
      }
      return;
    }

    if (!isFetching) {
      setIsAdvancedFilterLoadingMore(false);
    }
  }, [
    shouldUseAdvancedFilter,
    isAccountableSort,
    isFetching,
    isFetchingNextAccountable,
  ]);

  useEffect(() => {
    if (
      !shouldUseAdvancedFilter ||
      !isAccountableSort ||
      !hasNextAccountable ||
      isFetchingNextAccountable ||
      isAdvancedFilterLoadingMore ||
      isAccountableFilterRefreshing
    ) {
      return;
    }

    setIsAdvancedFilterLoadingMore(true);
    void fetchNextAccountable();
  }, [
    shouldUseAdvancedFilter,
    isAccountableSort,
    hasNextAccountable,
    isFetchingNextAccountable,
    isAdvancedFilterLoadingMore,
    isAccountableFilterRefreshing,
    fetchNextAccountable,
  ]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (isAccountableSort) {
          refetchAccountable();
        } else {
          refetchProjects();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAccountableSort, refetchProjects, refetchAccountable]);

  // Handle browser back/forward cache (pageshow with persisted === true)
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      // When navigating back via BFCache, ensure data is fresh
      if ((event as PageTransitionEvent).persisted) {
        if (isAccountableSort) {
          refetchAccountable();
        } else {
          refetchProjects();
        }
      }
    };

    window.addEventListener('pageshow', handlePageShow as EventListener);
    return () => {
      window.removeEventListener('pageshow', handlePageShow as EventListener);
    };
  }, [isAccountableSort, refetchProjects, refetchAccountable]);

  const { title, description, emptyMessage } = useMemo(() => {
    // Determine title and description based on sort parameter
    let pageTitle: string;
    let pageDescription: string;
    let pageEmptyMessage: string;

    if (sort === 'top-transparent') {
      pageTitle = 'Transparency Rank';
      pageDescription = `Completion rate = sum of published items' genesis itemweight / sum of items' itemweight (fixed across projects, current: ${TotalGenesisWeightSum})`;
      pageEmptyMessage = 'No projects found, check filter setting';
    } else if (sort === 'top-community-trusted') {
      pageTitle = 'Community-trusted Rank';
      pageDescription = `Projects are ranked based on the total amount of staked upvotes received from users. This reflects community recognition and perceived value`;
      pageEmptyMessage = 'No projects found, check filter setting';
    } else if (sort === 'top-accountable') {
      pageTitle = 'Accountability Rank';
      pageDescription = `This rank combines signals from transparency and community trust. Accountable score = completion rate × sqrt(vote weight).`;
      pageEmptyMessage = 'No projects found, check filter setting';
    } else {
      // For multiple categories, show a generic title
      const categoryDisplay =
        cats && cats.length > 0
          ? cats.length === 1
            ? cats[0]
            : 'Filtered'
          : null;

      pageTitle = categoryDisplay ? `${categoryDisplay} Projects` : 'List';
      pageDescription = categoryDisplay
        ? `Page Completion Rate (Transparency) * User Supported Votes`
        : '';
      pageEmptyMessage = categoryDisplay
        ? cats && cats.length === 1
          ? `No projects found, check filter setting`
          : 'No projects found matching the selected categories, check filter setting'
        : 'No projects found matching the conditions, check filter setting';
    }

    return {
      title: pageTitle,
      description: pageDescription,
      emptyMessage: pageEmptyMessage,
    };
  }, [sort, cats]);

  const showUpvote = useMemo(() => {
    return sort !== 'top-transparent';
  }, [sort]);

  const showTransparentScore = useMemo(() => {
    return sort === 'top-transparent';
  }, [sort]);

  useEffect(() => {
    if (projectList.length > 0) {
      devLog('projectList', projectList);
    }
  }, [projectList]);

  useEffect(() => {
    if (isAccountableSort && accountableProjectList.length > 0) {
      devLog('accountableProjectList', accountableProjectList);
    }
  }, [isAccountableSort, accountableProjectList]);

  return (
    <div className="pb-10">
      <div className="mb-[20px] flex w-full items-start justify-start gap-5 rounded-[10px] border border-[rgba(0,0,0,0.1)] bg-white p-5">
        <Image
          src="/images/projects/logo.png"
          alt="ECF project Logo"
          width={63}
          height={63}
        />
        <div className="flex-1">
          <ECFTypography type={'title'}>Projects</ECFTypography>
          <ECFTypography type={'subtitle2'} className="mt-2.5">
            Explore projects and initiatives here or add your own to the list!
          </ECFTypography>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <ECFButton onPress={handleProposeProject}>
              Propose a Project
            </ECFButton>
            <ECFButton
              onPress={() =>
                openExternalLink('https://ecf-pensieve-ai.vercel.app/')
              }
              className="border border-black/10 bg-transparent font-semibold hover:bg-black/5 focus:bg-black/5 active:bg-black/10"
            >
              <PlusCircle className="size-[20px] opacity-50" />
              <span>Pensieve Magic Pen</span>
            </ECFButton>
          </div>
        </div>
      </div>

      <div className="mobile:block hidden">
        {/* mobile filter and sort entry */}
        <div className=" flex items-center gap-0">
          <ProjectSortMobile />
          <ProjectFilterMobile
            advancedFilters={advancedFilters}
            onCreateAdvancedFilter={handleCreateFilter}
            onEditAdvancedFilter={handleEditFilter}
            onRemoveAdvancedFilter={handleRemoveFilter}
            onClearAdvancedFilters={clearAdvancedFilters}
            canUseAdvancedFilters={canUseAdvancedFilters}
            disabledReason={advancedFilterDisabledReason}
            onSaveAsFeed={handleOpenSaveFeed}
            canSaveFeed={hasSaveableState}
            saveDisabledReason={saveFeedDisabledReason}
          />
        </div>
        {/* Active Filters Display */}
        {cats && cats.length > 0 && (
          <div className="mt-[5px] text-left">
            <p className="text-[12px] font-normal text-black/50">
              Active Filters:{' '}
              {cats.length === 1 ? 'Category' : `${cats.length} Categories`}
            </p>
          </div>
        )}
      </div>

      <div className="mobile:flex-col mobile:gap-5 mobile:px-0 flex items-start justify-between gap-10 px-2.5">
        <div className="w-full flex-1">
          <div className="border-b border-black/10 px-2.5 py-4">
            {sort === 'top-transparent' ||
            sort === 'top-community-trusted' ||
            sort === 'top-accountable' ? (
              <>
                <h1 className="text-[24px] font-[700] leading-[1.4] text-black/80">
                  {title}
                </h1>
                <p className="mt-[5px] text-[14px] font-[400] leading-[19px] text-black/60">
                  {description}
                </p>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <ECFTypography type={'subtitle1'}>{title}</ECFTypography>
                {/* <ProjectFilter /> */}
              </div>
            )}
          </div>

          <ProjectListWrapper
            isLoading={isListLoading}
            isFetchingNextPage={isListFetchingNext}
            hasNextPage={hasListNextPage}
            projectList={displayedProjects}
            emptyMessage={emptyMessage}
            onLoadMore={handleLoadMoreAction}
            onSuccess={handleUpvoteSuccess}
            showTransparentScore={showTransparentScore}
            showUpvote={showUpvote}
            showCreator={true}
          />
        </div>

        <div className="mobile:hidden flex w-[300px] flex-col gap-[10px]">
          <ProjectSort />
          <ProjectFilter />
          <CustomFilterPanel
            filters={advancedFilters}
            onCreate={handleCreateFilter}
            onEdit={handleEditFilter}
            onRemove={handleRemoveFilter}
            onClearAll={clearAdvancedFilters}
            isDisabled={!canUseAdvancedFilters}
            disabledReason={advancedFilterDisabledReason}
            onSaveAsFeed={handleOpenSaveFeed}
            canSaveFeed={hasSaveableState}
            saveDisabledReason={saveFeedDisabledReason}
          />
          <RewardCard />
        </div>

        <div className="pc:hidden tablet:hidden mt-5 w-full lg:hidden ">
          <RewardCard />
        </div>
      </div>

      <CustomFilterModal
        isOpen={isModalOpen}
        state={modalState}
        onClose={handleModalClose}
        onSave={handleModalSave}
        onDelete={handleRemoveFilter}
      />
      <SaveFeedModal
        isOpen={isSaveFeedModalOpen}
        targetPath={currentTargetPath}
        onClose={() => setIsSaveFeedModalOpen(false)}
      />
    </div>
  );
};

const ProjectsLoading = () => (
  <div className="pb-10">
    <div className="mb-[20px] flex w-full items-start justify-start gap-5 rounded-[10px] border border-[rgba(0,0,0,0.1)] bg-white p-5">
      <div className="size-[63px] animate-pulse rounded-lg bg-gray-200" />
      <div className="flex-1">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
        <div className="mt-2.5 h-4 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-2.5 h-10 w-28 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
    <div className="mobile:flex-col mobile:gap-5 flex items-start justify-between gap-10 px-2.5">
      <div className="w-full flex-1">
        <div className="border-b border-black/10 px-2.5 py-4">
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="pb-2.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <ProjectCardSkeleton key={index} showBorder={true} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// 主页面组件
const ProjectsPage = () => {
  return (
    <Suspense fallback={<ProjectsLoading />}>
      <ProjectsContent />
    </Suspense>
  );
};

export default ProjectsPage;
