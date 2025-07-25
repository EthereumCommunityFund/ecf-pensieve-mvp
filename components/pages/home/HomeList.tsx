'use client';

import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { Button } from '@/components/base/button';
import { CommunityTrustedIcon, TagIcon } from '@/components/icons';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';
import { devLog } from '@/utils/devLog';
import { formatDateWithTimeGMT } from '@/utils/formatters';

import { ProjectListWrapper } from '../project/ProjectListWrapper';

import SectionHeaderSmall from './SectionHeaderSmall';

interface ISectionProps {
  title: string;
  description: string;
  buttonText?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  updateAt?: string;
  icon?: React.ReactNode;
}

const SectionHeader = (props: ISectionProps) => {
  return (
    <div className="px-[10px]">
      <div className="mobile:flex-col mobile:items-start flex flex-1 items-center justify-between gap-[10px] py-[4px]">
        <div>
          <div className="flex items-center gap-[10px]">
            {props.icon}
            <p className="tablet:text-[18px] mobile:text-[18px] text-[24px] font-[700] leading-[1.4] text-black/80">
              {props.title}
            </p>
          </div>

          {props.description && (
            <p className="mt-[5px] text-[14px] font-[400] leading-[19px] text-black/60">
              {props.description}
            </p>
          )}
        </div>
        {props.buttonText && (
          <div className="">
            <Button size="sm" onPress={props.onClick} className="font-[400]">
              {props.buttonText}
            </Button>
          </div>
        )}
      </div>
      {props.updateAt && (
        <p className="mt-[10px] text-left text-[10px] font-[400] leading-[14px] text-black/60">
          {props.updateAt}
        </p>
      )}
    </div>
  );
};

const HomeList = () => {
  const router = useRouter();
  const limit = 10;

  // Left side: Genesis weight paginated data with infinite scroll
  const {
    data: genesisData,
    isLoading: isLoadingGenesis,
    fetchNextPage: fetchNextGenesis,
    hasNextPage: hasNextGenesis,
    isFetchingNextPage: isFetchingNextGenesis,
  } = trpc.rank.getTopRanksByGenesisWeightPaginated.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  // Right side: Support projects (existing)
  const { data: ranksData, isLoading: isLoadingSupport } =
    trpc.rank.getTopRanks.useQuery();

  // Right side: Category-based projects
  const { data: communityProjects, isLoading: isLoadingCommunity } =
    trpc.project.getProjects.useQuery({
      limit,
      categories: ['Local Communities'],
      isPublished: true,
    });

  const { data: eventsProjects, isLoading: isLoadingEvents } =
    trpc.project.getProjects.useQuery({
      limit,
      categories: ['Events'],
      isPublished: true,
    });

  const { data: hubsProjects, isLoading: isLoadingHubs } =
    trpc.project.getProjects.useQuery({
      limit,
      categories: ['Hubs'],
      isPublished: true,
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

  useEffect(() => {
    if (byGenesisProjects.length > 0) {
      devLog('byGenesisProjects', byGenesisProjects);
    }
    if (bySupportProjects.length > 0) {
      devLog('bySupportProjects', bySupportProjects);
    }
  }, [byGenesisProjects, bySupportProjects]);

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
          'DD-MM-YYYY | HH:mm',
        )} GMT`
      : '';
  }, [transparentProjectsUpdatedAt]);

  // Get the latest updatedAt time from all projects for community-trusted projects
  const communityTrustedUpdatedAt = ranksData?.bySupport?.reduce(
    (latest, project) => {
      if (!project.updatedAt) return latest;
      if (!latest) return project.updatedAt;
      return new Date(project.updatedAt) > new Date(latest)
        ? project.updatedAt
        : latest;
    },
    null as Date | null,
  );

  const displayUpdatedAtOfTrust = useMemo(() => {
    return communityTrustedUpdatedAt
      ? `Updated: ${formatDateWithTimeGMT(
          communityTrustedUpdatedAt,
          'DD-MM-YYYY | HH:mm',
        )} GMT`
      : '';
  }, [communityTrustedUpdatedAt]);

  const handleViewTopTransparentProjects = useCallback(() => {
    router.push('/projects?type=transparent');
  }, [router]);

  const handleViewTopCommunityTrustedProjects = useCallback(() => {
    router.push('/projects?type=community-trusted');
  }, [router]);

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
          onSuccess={() => {}}
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
            projectList={bySupportProjects as IProject[]}
            onLoadMore={() => {}}
            isFetchingNextPage={false}
            emptyMessage="No projects found"
            onSuccess={() => {}}
            showCreator={false}
            showUpvote={true}
            showTransparentScore={false}
            size="sm"
            viewAllUrl="/projects?type=community-trusted"
          />
        </div>

        {/* Column 2: Community */}
        <div className="flex flex-col gap-[10px] rounded-[10px] border border-black/10 p-[14px]">
          <SectionHeaderSmall
            title="Local Communities"
            description="Discover local and cyber communities"
            icon={<TagIcon />}
          />
          <ProjectListWrapper
            isLoading={isLoadingCommunity}
            projectList={(communityProjects?.items || []) as IProject[]}
            onLoadMore={() => {}}
            isFetchingNextPage={false}
            emptyMessage="No projects found"
            onSuccess={() => {}}
            showCreator={false}
            showUpvote={true}
            showTransparentScore={false}
            size="sm"
            viewAllUrl={`/projects?cat=${encodeURIComponent('Local Communities')}`}
          />
        </div>

        {/* Column 3: Events */}
        <div className="lex flex-col gap-[10px] rounded-[10px] border border-black/10 p-[14px]">
          <SectionHeaderSmall
            title="Events"
            description="Explore event organizations and pop-up events"
            icon={<TagIcon />}
          />
          <ProjectListWrapper
            isLoading={isLoadingEvents}
            projectList={(eventsProjects?.items || []) as IProject[]}
            onLoadMore={() => {}}
            isFetchingNextPage={false}
            emptyMessage="No projects found"
            onSuccess={() => {}}
            showCreator={false}
            showUpvote={true}
            showTransparentScore={false}
            size="sm"
            viewAllUrl={`/projects?cat=Events`}
          />
        </div>

        {/* Column 4: Hubs */}
        <div className="lex flex-col gap-[10px] rounded-[10px] border border-black/10 p-[14px]">
          <SectionHeaderSmall
            title="Hubs"
            description="Explore digital and physical hubs"
            icon={<TagIcon />}
          />
          <ProjectListWrapper
            isLoading={isLoadingHubs}
            projectList={(hubsProjects?.items || []) as IProject[]}
            onLoadMore={() => {}}
            isFetchingNextPage={false}
            emptyMessage="No projects found"
            onSuccess={() => {}}
            showCreator={false}
            showUpvote={true}
            showTransparentScore={false}
            size="sm"
            viewAllUrl={`/projects?cat=Hubs`}
          />
        </div>
      </div>
    </div>
  );
};

export default HomeList;
