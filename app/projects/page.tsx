'use client';

import { Image } from '@heroui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';

import { ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import { ProjectListWrapper } from '@/components/pages/home/HomeList';
import BackHeader from '@/components/pages/project/BackHeader';
import ProjectCard, {
  ProjectCardSkeleton,
} from '@/components/pages/project/ProjectCard';
import RewardCard from '@/components/pages/project/RewardCardEntry';
import { useAuth } from '@/context/AuthContext';
import { useUpvote } from '@/hooks/useUpvote';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';
import { devLog } from '@/utils/devLog';

const ProjectsPage = () => {
  const { profile, showAuthPrompt } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type');

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
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !type,
    },
  );

  const {
    data: ranksData,
    isLoading: isRankLoading,
    refetch: refetchRanks,
  } = trpc.rank.getTopRanks.useQuery(undefined, {
    enabled: !!type,
  });

  const { handleUpvote, getProjectLikeRecord, UpvoteModalComponent } =
    useUpvote({
      onSuccess: type ? refetchRanks : refetchProjects,
    });

  const handleLoadMore = () => {
    if (!isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleProposeProject = useCallback(() => {
    if (!profile) {
      showAuthPrompt();
      return;
    }
    router.push('/project/create');
  }, [profile, showAuthPrompt, router]);

  const allProjects = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || [];
  }, [data]);

  const { projectList, title, description, emptyMessage, currentIsLoading } =
    useMemo(() => {
      if (type === 'transparent') {
        return {
          projectList:
            ranksData?.byGenesisWeight?.map((rank: any) => rank.project) || [],
          title: 'Top Transparent Projects',
          description: `Completion rate = sum of published items' genesis itemweight / sum of items' itemweight (fixed across projects)`,
          emptyMessage: 'No transparent projects found',
          currentIsLoading: isRankLoading,
        };
      } else if (type === 'community-trusted') {
        return {
          projectList: ranksData?.bySupport || [],
          title: 'Top Community-trusted',
          description: `Projects are ranked based on the total amount of staked upvotes received from users. This reflects community recognition and perceived value`,
          emptyMessage: 'No community-trusted projects found',
          currentIsLoading: isRankLoading,
        };
      }
      return {
        projectList: allProjects,
        title: 'Recent Projects',
        description: '',
        emptyMessage: 'No Published Project Yet',
        currentIsLoading: isLoading,
      };
    }, [type, ranksData, allProjects, isRankLoading, isLoading]);

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
        {/* <div className="pc:hidden tablet:hidden flex w-full items-center justify-end gap-2.5 lg:hidden">
          <ECFButton $size="small">Sort</ECFButton>
          <ECFButton $size="small">Filter</ECFButton>
        </div> */}

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
              <ECFTypography type={'subtitle1'}>{title}</ECFTypography>
            )}
          </div>

          {type ? (
            <ProjectListWrapper
              isLoading={currentIsLoading}
              projectList={projectList as IProject[]}
              onRefetch={type ? refetchRanks : refetchProjects}
              emptyMessage={emptyMessage}
            />
          ) : (
            <div className="pb-2.5">
              {currentIsLoading ? (
                <>
                  {Array.from({ length: 10 }).map((_, index) => (
                    <ProjectCardSkeleton key={index} showBorder={true} />
                  ))}
                </>
              ) : projectList.length > 0 ? (
                <>
                  {projectList.map((project) => {
                    const projectLikeRecord = getProjectLikeRecord(project.id);

                    return (
                      <ProjectCard
                        key={project.id}
                        project={project as IProject}
                        showBorder={true}
                        onUpvote={handleUpvote}
                        userLikeRecord={
                          projectLikeRecord
                            ? {
                                id: project.id,
                                weight: projectLikeRecord.weight || 0,
                              }
                            : null
                        }
                      />
                    );
                  })}

                  {isFetchingNextPage && (
                    <ProjectCardSkeleton showBorder={true} />
                  )}

                  {hasNextPage && (
                    <div className="flex justify-center py-4">
                      <ECFButton
                        onPress={handleLoadMore}
                        isDisabled={isFetchingNextPage}
                        $size="small"
                      >
                        {isFetchingNextPage ? 'Loading...' : 'Load More'}
                      </ECFButton>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-center py-[80px]">
                  <ECFTypography type="subtitle1">{emptyMessage}</ECFTypography>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mobile:hidden">
          {/* <div className="flex h-[73px] w-[300px] items-start justify-start gap-5">
            <ECFButton $size="small" className="min-w-0 px-2.5">
              Sort
            </ECFButton>
            <ECFButton $size="small" className="min-w-0 px-2.5">
              Filter
            </ECFButton>
          </div> */}

          <RewardCard />
        </div>

        <div className="pc:hidden tablet:hidden mt-5 w-full lg:hidden ">
          <RewardCard />
        </div>
      </div>

      {UpvoteModalComponent}
    </div>
  );
};

export default ProjectsPage;
