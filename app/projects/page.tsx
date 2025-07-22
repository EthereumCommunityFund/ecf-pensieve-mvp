'use client';

import { Image } from '@heroui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo } from 'react';

import { ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import BackHeader from '@/components/pages/project/BackHeader';
import ProjectFilter from '@/components/pages/project/Filter';
import { ProjectCardSkeleton } from '@/components/pages/project/ProjectCard';
import { ProjectListWrapper } from '@/components/pages/project/ProjectListWrapper';
import RewardCard from '@/components/pages/project/RewardCardEntry';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';
import { devLog } from '@/utils/devLog';

const ProjectsContent = () => {
  const { profile, showAuthPrompt } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const category = searchParams.get('cat');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch: refetchProjects,
  } = trpc.project.getProjects.useInfiniteQuery(
    {
      limit: 10,
      isPublished: true,
      ...(category && { categories: [category] }),
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !type,
    },
  );

  const {
    data: genesisData,
    fetchNextPage: fetchNextGenesisPage,
    hasNextPage: hasNextGenesisPage,
    isFetchingNextPage: isFetchingNextGenesisPage,
    isLoading: isGenesisLoading,
    refetch: refetchGenesis,
  } = trpc.rank.getTopRanksByGenesisWeightPaginated.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: type === 'transparent',
    },
  );

  const {
    data: supportData,
    fetchNextPage: fetchNextSupportPage,
    hasNextPage: hasNextSupportPage,
    isFetchingNextPage: isFetchingNextSupportPage,
    isLoading: isSupportLoading,
    refetch: refetchSupport,
  } = trpc.rank.getTopRanksBySupportPaginated.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage: { nextCursor: number | undefined }) =>
        lastPage.nextCursor,
      enabled: type === 'community-trusted',
    },
  );

  const handleProposeProject = useCallback(() => {
    if (!profile) {
      showAuthPrompt();
      return;
    }
    router.push('/project/create');
  }, [profile, showAuthPrompt, router]);

  const onUpvoteSuccess = () => {
    if (type === 'transparent') {
      refetchGenesis();
    } else if (type === 'community-trusted') {
      refetchSupport();
    } else {
      refetchProjects();
    }
  };

  const handleLoadMore = () => {
    if (type === 'transparent') {
      fetchNextGenesisPage();
    } else if (type === 'community-trusted') {
      fetchNextSupportPage();
    } else {
      fetchNextPage();
    }
  };

  const {
    projectList,
    title,
    description,
    emptyMessage,
    currentIsLoading,
    currentHasNextPage,
    currentIsFetchingNextPage,
  } = useMemo(() => {
    if (type === 'transparent') {
      const list =
        genesisData?.pages
          .flatMap((page: { items: any[] }) => page.items)
          .map((rank) => rank.project) || [];
      return {
        projectList: list as IProject[],
        title: 'Top Transparent Projects',
        description: `Completion rate = sum of published items' genesis itemweight / sum of items' itemweight (fixed across projects)`,
        emptyMessage: 'No transparent projects found',
        currentIsLoading: isGenesisLoading,
        currentHasNextPage: hasNextGenesisPage,
        currentIsFetchingNextPage: isFetchingNextGenesisPage,
      };
    }
    if (type === 'community-trusted') {
      const list = supportData?.pages.flatMap((page) => page.items) || [];
      return {
        projectList: list as IProject[],
        title: 'Top Community-trusted',
        description: `Projects are ranked based on the total amount of staked upvotes received from users. This reflects community recognition and perceived value`,
        emptyMessage: 'No community-trusted projects found',
        currentIsLoading: isSupportLoading,
        currentHasNextPage: hasNextSupportPage,
        currentIsFetchingNextPage: isFetchingNextSupportPage,
      };
    }
    const list = data?.pages.flatMap((page) => page.items) || [];
    return {
      projectList: list as IProject[],
      title: category ? `${category} Projects` : 'Recent Projects',
      description: category
        ? `Page Completion Rate (Transparency) * User Supported Votes`
        : '',
      emptyMessage: category
        ? `No ${category} projects found`
        : 'No Published Project Yet',
      currentIsLoading: isLoading,
      currentHasNextPage: hasNextPage,
      currentIsFetchingNextPage: isFetchingNextPage,
    };
  }, [
    type,
    category,
    genesisData,
    supportData,
    data,
    isGenesisLoading,
    isSupportLoading,
    isLoading,
    hasNextGenesisPage,
    hasNextSupportPage,
    hasNextPage,
    isFetchingNextGenesisPage,
    isFetchingNextSupportPage,
    isFetchingNextPage,
  ]);

  const showTransparentScore = useMemo(() => {
    return type === 'transparent';
  }, [type]);

  const showCreator = useMemo(() => {
    return type !== 'transparent';
  }, [type]);

  const showUpvote = useMemo(() => {
    return type !== 'transparent';
  }, [type]);

  useEffect(() => {
    if (projectList.length > 0) {
      devLog('projectList', projectList);
    }
  }, [projectList]);

  return (
    <div className="pb-10">
      {!type ? (
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
            <ECFButton onPress={handleProposeProject} className="mt-2.5">
              Propose a Project
            </ECFButton>
          </div>
        </div>
      ) : (
        <BackHeader className="px-[10px]" />
      )}

      <div className="mobile:flex-col mobile:gap-5 flex items-start justify-between gap-10 px-2.5">
        <div className="w-full flex-1">
          <div className="border-b border-black/10 px-2.5 py-4">
            {type ? (
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
                <ProjectFilter />
              </div>
            )}
          </div>

          <ProjectListWrapper
            isLoading={currentIsLoading}
            isFetchingNextPage={currentIsFetchingNextPage}
            hasNextPage={currentHasNextPage}
            projectList={projectList}
            emptyMessage={emptyMessage}
            onLoadMore={handleLoadMore}
            onSuccess={onUpvoteSuccess}
            showTransparentScore={showTransparentScore}
            showUpvote={showUpvote}
            showCreator={showCreator}
          />
        </div>

        <div className="mobile:hidden">
          <RewardCard />
        </div>

        <div className="pc:hidden tablet:hidden mt-5 w-full lg:hidden ">
          <RewardCard />
        </div>
      </div>
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
