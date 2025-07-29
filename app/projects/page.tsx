'use client';

import { Image } from '@heroui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import { ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import ProjectFilter from '@/components/pages/project/filterAndSort/Filter';
import ProjectFilterMobile from '@/components/pages/project/filterAndSort/FilterMobile';
import ProjectSort from '@/components/pages/project/filterAndSort/Sort';
import ProjectSortMobile from '@/components/pages/project/filterAndSort/SortMobile';
import { ProjectCardSkeleton } from '@/components/pages/project/ProjectCard';
import { ProjectListWrapper } from '@/components/pages/project/ProjectListWrapper';
import RewardCard from '@/components/pages/project/RewardCardEntry';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';
import { SortBy, SortOrder } from '@/types/sort';
import { devLog } from '@/utils/devLog';

const ProjectsContent = () => {
  const { profile, showAuthPrompt } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get filter and sort parameters from URL - memoize to prevent recreation
  const catsParam = searchParams.get('cats');
  const cats = useMemo(() => {
    return catsParam?.split(',').filter(Boolean);
  }, [catsParam]);

  const sort = searchParams.get('sort');

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
    return sort ? parseSortParam(sort) : {};
  }, [sort]);

  const [offset, setOffset] = useState(0);
  const [allProjects, setAllProjects] = useState<IProject[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const {
    data,
    isLoading,
    isFetching,
    refetch: refetchProjects,
  } = trpc.project.getProjects.useQuery(
    {
      limit: 10,
      offset,
      isPublished: true,
      ...(cats && cats.length > 0 && { categories: cats }),
      ...sortParams,
    },
    {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
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
    refetchProjects();
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    setOffset((prev) => prev + 10);
  };

  // Manage accumulated projects list
  useEffect(() => {
    if (data?.items) {
      if (offset === 0) {
        // First load or refresh
        setAllProjects(data.items as IProject[]);
      } else {
        // Load more
        setAllProjects((prev) => [...prev, ...(data.items as IProject[])]);
      }
      setIsLoadingMore(false);
    }
  }, [data, offset]);

  // Reset when filters change - use stable dependency
  const catsKey = cats?.join(',') || '';
  useEffect(() => {
    setOffset(0);
    setAllProjects([]);
  }, [sort, catsKey]);

  // Trigger refetch when query params change (including clearing filters)
  useEffect(() => {
    // Clear existing projects to show skeleton while refetching
    setAllProjects([]);
    refetchProjects();
  }, [searchParams, refetchProjects]);

  // Refetch data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetchProjects();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetchProjects]);

  const { projectList, title, description, emptyMessage } = useMemo(() => {
    // Determine title and description based on sort parameter
    let pageTitle: string;
    let pageDescription: string;
    let pageEmptyMessage: string;

    if (sort === 'top-transparent') {
      pageTitle = 'Top Transparent Projects';
      pageDescription = `Completion rate = sum of published items' genesis itemweight / sum of items' itemweight (fixed across projects)`;
      pageEmptyMessage = 'No transparent projects found';
    } else if (sort === 'top-community-trusted') {
      pageTitle = 'Top Community-trusted';
      pageDescription = `Projects are ranked based on the total amount of staked upvotes received from users. This reflects community recognition and perceived value`;
      pageEmptyMessage = 'No community-trusted projects found';
    } else {
      // For multiple categories, show a generic title
      const categoryDisplay =
        cats && cats.length > 0
          ? cats.length === 1
            ? cats[0]
            : 'Filtered'
          : null;

      pageTitle = categoryDisplay
        ? `${categoryDisplay} Projects`
        : 'Recent Projects';
      pageDescription = categoryDisplay
        ? `Page Completion Rate (Transparency) * User Supported Votes`
        : '';
      pageEmptyMessage = categoryDisplay
        ? cats && cats.length === 1
          ? `No ${cats[0]} projects found`
          : 'No projects found matching the selected categories'
        : 'No Published Project Yet';
    }

    return {
      projectList: allProjects,
      title: pageTitle,
      description: pageDescription,
      emptyMessage: pageEmptyMessage,
    };
  }, [sort, cats, allProjects]);

  const showTransparentScore = useMemo(() => {
    return sort === 'top-transparent';
  }, [sort]);

  useEffect(() => {
    if (allProjects.length > 0) {
      devLog('projectList', allProjects);
    }
  }, [allProjects]);

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
          <ECFButton onPress={handleProposeProject} className="mt-2.5">
            Propose a Project
          </ECFButton>
        </div>
      </div>

      <div className="mobile:block hidden">
        {/* mobile filter and sort entry */}
        <div className=" flex items-center gap-0">
          <ProjectSortMobile />
          <ProjectFilterMobile />
        </div>
        {/* Active Filters Display */}
        {cats && cats.length > 0 && (
          <div className="mt-[5px] text-left">
            <p className="font-['Open_Sans'] text-[12px] font-normal text-black/50">
              Active Filters:{' '}
              {cats.length === 1 ? 'Category' : `${cats.length} Categories`}
            </p>
          </div>
        )}
      </div>

      <div className="mobile:flex-col mobile:gap-5 flex items-start justify-between gap-10 px-2.5">
        <div className="w-full flex-1">
          <div className="border-b border-black/10 px-2.5 py-4">
            {sort === 'top-transparent' || sort === 'top-community-trusted' ? (
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
            isLoading={
              (isLoading || (isFetching && offset === 0)) &&
              projectList.length === 0
            }
            isFetchingNextPage={isLoadingMore}
            hasNextPage={data?.hasNextPage}
            projectList={projectList}
            emptyMessage={emptyMessage}
            onLoadMore={handleLoadMore}
            onSuccess={onUpvoteSuccess}
            showTransparentScore={showTransparentScore}
            showUpvote={true}
            showCreator={true}
          />
        </div>

        <div className="mobile:hidden flex w-[300px] flex-col gap-[10px]">
          <ProjectSort />
          <ProjectFilter />
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
