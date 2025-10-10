'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import SortTabs from '@/components/base/SortTabs';
import { CommunityTrustedIcon, TagIcon } from '@/components/icons';
import {
  DEFAULT_SORT_TYPE,
  getSortTabs,
  SortType,
} from '@/constants/sortConfig';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';
import { SortBy, SortOrder } from '@/types/sort';
import { devLog } from '@/utils/devLog';
import { formatDateWithTimeGMT } from '@/utils/formatters';

import { ProjectListWrapper } from '../project/ProjectListWrapper';

import ProjectIntroCard from './ProjectIntroCard';
import SectionHeader from './SectionHeader';
import SectionHeaderSmall from './SectionHeaderSmall';

const HomeList = () => {
  const router = useRouter();
  const limit = 5;

  // Right side section sort states
  const [communitySort, setCommunitySort] =
    useState<SortType>(DEFAULT_SORT_TYPE);
  const [eventsSort, setEventsSort] = useState<SortType>(DEFAULT_SORT_TYPE);
  const [hubsSort, setHubsSort] = useState<SortType>(DEFAULT_SORT_TYPE);

  const resolveSortParams = useCallback((sortType: SortType) => {
    return { sortBy: sortType, sortOrder: SortOrder.DESC } as const;
  }, []);

  // Left side: Genesis weight paginated data with infinite scroll
  const {
    data: genesisData,
    isLoading: isLoadingGenesis,
    fetchNextPage: fetchNextGenesis,
    hasNextPage: hasNextGenesis,
    isFetchingNextPage: isFetchingNextGenesis,
    refetch: refetchGenesis,
  } = trpc.rank.getTopRanksByGenesisWeightPaginated.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
  );

  // Right side: Support projects (existing)
  const {
    data: ranksData,
    isLoading: isLoadingSupport,
    refetch: refetchRanksData,
  } = trpc.rank.getTopRanks.useQuery();

  // Right side: Category-based projects
  const {
    data: communityProjects,
    isLoading: isLoadingCommunity,
    refetch: refetchCommunity,
  } = trpc.project.getProjects.useQuery({
    limit,
    categories: ['Local Communities'],
    isPublished: true,
    ...resolveSortParams(communitySort),
  });

  const {
    data: eventsProjects,
    isLoading: isLoadingEvents,
    refetch: refetchEvents,
  } = trpc.project.getProjects.useQuery({
    limit,
    categories: ['Events'],
    isPublished: true,
    ...resolveSortParams(eventsSort),
  });

  const {
    data: hubsProjects,
    isLoading: isLoadingHubs,
    refetch: refetchHubs,
  } = trpc.project.getProjects.useQuery({
    limit,
    categories: ['Hubs'],
    isPublished: true,
    ...resolveSortParams(hubsSort),
  });

  // Flatten paginated genesis projects
  const byGenesisProjects = useMemo(() => {
    return (
      genesisData?.pages.flatMap((page) =>
        page.items.map((rank: any) => rank.project),
      ) || []
    );
  }, [genesisData]);

  const bySupportProjects = useMemo(() => {
    return ranksData?.bySupport?.slice(0, limit) || [];
  }, [ranksData?.bySupport, limit]);

  const byAccountableProjects = useMemo(() => {
    const items =
      ranksData?.byGenesisSupport?.map((rank) => rank.project) || [];
    return items.slice(0, limit);
  }, [ranksData?.byGenesisSupport, limit]);

  useEffect(() => {
    if (genesisData) {
      devLog('genesisData', genesisData);
    }
    if (bySupportProjects.length > 0) {
      devLog('bySupportProjects', bySupportProjects);
    }
    if (byAccountableProjects.length > 0) {
      devLog('byAccountableProjects', byAccountableProjects);
    }
  }, [genesisData, bySupportProjects, byAccountableProjects]);

  // Get the latest updatedAt time from all ranks for transparent projects
  const transparentProjectsUpdatedAt = ranksData?.byGenesisWeight?.reduce(
    (latest, rank) => {
      if (!rank.updatedAt) return latest;
      if (!latest) return rank.updatedAt;
      return new Date(rank.updatedAt) > new Date(latest)
        ? rank.updatedAt
        : latest;
    },
    null as Date | null,
  );

  const displayUpdatedAtOfTransparent = useMemo(() => {
    return transparentProjectsUpdatedAt
      ? `Updated: ${formatDateWithTimeGMT(
          transparentProjectsUpdatedAt,
          'YYYY-MM-DD | HH:mm',
        )} GMT`
      : '';
  }, [transparentProjectsUpdatedAt]);

  const handleViewTopTransparentProjects = useCallback(() => {
    router.push('/projects?sort=top-transparent');
  }, [router]);

  const handleViewTopCommunityTrustedProjects = useCallback(() => {
    router.push('/projects?sort=top-community-trusted');
  }, [router]);
  const handleViewTopAccountableProjects = useCallback(() => {
    router.push('/projects?sort=top-accountable');
  }, [router]);

  // Refetch all method to refresh all data
  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchGenesis(),
      refetchRanksData(),
      refetchCommunity(),
      refetchEvents(),
      refetchHubs(),
    ]);
  }, [
    refetchGenesis,
    refetchRanksData,
    refetchCommunity,
    refetchEvents,
    refetchHubs,
  ]);

  // Infinite scroll implementation with IntersectionObserver
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextGenesis && !isFetchingNextGenesis) {
          fetchNextGenesis();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      },
    );

    observerRef.current.observe(loadMoreElement);

    return () => {
      if (observerRef.current && loadMoreElement) {
        observerRef.current.unobserve(loadMoreElement);
      }
    };
  }, [hasNextGenesis, isFetchingNextGenesis, fetchNextGenesis]);

  return (
    <div className="tablet:gap-[10px] mt-5 flex gap-[20px]">
      {/* Left side: Top Transparent Projects with infinite scroll */}
      <div className="mobile:p-0 flex-1 rounded-[10px] p-[10px]">
        <SectionHeader
          title="Top Transparent Projects"
          description={`Completion rate = sum of published items' genesis itemweight / sum of items' itemweight (fixed across projects)`}
          buttonText="View All Top"
          onClick={handleViewTopTransparentProjects}
          updateAt={displayUpdatedAtOfTransparent}
        />
        <ProjectListWrapper
          isLoading={isLoadingGenesis}
          projectList={byGenesisProjects as IProject[]}
          onLoadMore={() => {}}
          isFetchingNextPage={isFetchingNextGenesis}
          emptyMessage="No transparent projects found"
          onSuccess={(_result) => refetchAll()}
          showCreator={false}
          showUpvote={false}
          showTransparentScore={true}
        />
        {hasNextGenesis && (
          <div
            ref={loadMoreRef}
            className="flex h-10 items-center justify-center"
          >
            {isFetchingNextGenesis && (
              <span className="text-sm text-gray-500">Loading more...</span>
            )}
          </div>
        )}
      </div>

      {/* Right side: 4 columns */}
      <div className="tablet:w-[325px] mobile:hidden flex w-[390px] flex-col gap-[10px]">
        <ProjectIntroCard />

        {/* Column 0: Top Accountable */}
        <div className="rounded-[10px] border border-black/10 p-[14px]">
          <SectionHeaderSmall
            title="Top Accountable"
            description="Projects ranked by accountability score"
            onClick={handleViewTopAccountableProjects}
            icon={<CommunityTrustedIcon />}
          />
          <ProjectListWrapper
            isLoading={isLoadingSupport}
            projectList={byAccountableProjects as unknown as IProject[]}
            onLoadMore={() => {}}
            isFetchingNextPage={false}
            emptyMessage="No projects found"
            onSuccess={(_result) => refetchAll()}
            showCreator={false}
            showUpvote={true}
            showTransparentScore={false}
            size="sm"
            viewAllUrl="/projects?sort=top-accountable"
          />
        </div>

        {/* Column 1: Top Community-trusted */}
        <div className="rounded-[10px] border border-black/10 p-[14px]">
          <SectionHeaderSmall
            title={`Top Community-trusted`}
            description={`Projects ranked by staked upvotes`}
            onClick={handleViewTopCommunityTrustedProjects}
            icon={<CommunityTrustedIcon />}
          />
          <ProjectListWrapper
            isLoading={isLoadingSupport}
            projectList={bySupportProjects as unknown as IProject[]}
            onLoadMore={() => {}}
            isFetchingNextPage={false}
            emptyMessage="No projects found"
            onSuccess={(_result) => refetchAll()}
            showCreator={false}
            showUpvote={true}
            showTransparentScore={false}
            size="sm"
            viewAllUrl="/projects?sort=top-community-trusted"
          />
        </div>

        {/* Column 2: Community */}
        <div className="flex flex-col gap-[10px] rounded-[10px] border border-black/10 p-[14px]">
          <SectionHeaderSmall
            title="Local Communities"
            description="Discover local and cyber communities"
            icon={<TagIcon />}
          />
          <SortTabs<SortType>
            tabs={getSortTabs()}
            activeKey={communitySort}
            onChange={setCommunitySort}
          />
          <ProjectListWrapper
            isLoading={isLoadingCommunity}
            projectList={(communityProjects?.items || []) as IProject[]}
            onLoadMore={() => {}}
            isFetchingNextPage={false}
            emptyMessage="No projects found"
            onSuccess={(_result) => refetchAll()}
            showCreator={false}
            showUpvote={false}
            showTransparentScore={false}
            size="sm"
            viewAllUrl={`/projects?cats=${encodeURIComponent('Local Communities')}&sort=${communitySort === SortBy.TRANSPARENT ? 'top-transparent' : 'top-community-trusted'}`}
          />
        </div>

        {/* Column 3: Events */}
        <div className="flex flex-col gap-[10px] rounded-[10px] border border-black/10 p-[14px]">
          <SectionHeaderSmall
            title="Events"
            description="Explore event organizations and pop-up events"
            icon={<TagIcon />}
          />
          <SortTabs<SortType>
            tabs={getSortTabs()}
            activeKey={eventsSort}
            onChange={setEventsSort}
          />
          <ProjectListWrapper
            isLoading={isLoadingEvents}
            projectList={(eventsProjects?.items || []) as IProject[]}
            onLoadMore={() => {}}
            isFetchingNextPage={false}
            emptyMessage="No projects found"
            onSuccess={(_result) => refetchAll()}
            showCreator={false}
            showUpvote={false}
            showTransparentScore={false}
            size="sm"
            viewAllUrl={`/projects?cats=Events&sort=${eventsSort === SortBy.TRANSPARENT ? 'top-transparent' : 'top-community-trusted'}`}
          />
        </div>

        {/* Column 4: Hubs */}
        <div className="flex flex-col gap-[10px] rounded-[10px] border border-black/10 p-[14px]">
          <SectionHeaderSmall
            title="Hubs"
            description="Explore digital and physical hubs"
            icon={<TagIcon />}
          />
          <SortTabs<SortType>
            tabs={getSortTabs()}
            activeKey={hubsSort}
            onChange={setHubsSort}
          />
          <ProjectListWrapper
            isLoading={isLoadingHubs}
            projectList={(hubsProjects?.items || []) as IProject[]}
            onLoadMore={() => {}}
            isFetchingNextPage={false}
            emptyMessage="No projects found"
            onSuccess={(_result) => refetchAll()}
            showCreator={false}
            showUpvote={false}
            showTransparentScore={false}
            size="sm"
            viewAllUrl={`/projects?cats=Hubs&sort=${hubsSort === SortBy.TRANSPARENT ? 'top-transparent' : 'top-community-trusted'}`}
          />
        </div>
      </div>
    </div>
  );
};

export default HomeList;
