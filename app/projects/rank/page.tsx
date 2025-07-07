'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';

import { ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
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
    },
  );

  // Use the upvote hook with refresh callback
  const { handleUpvote, getProjectLikeRecord, UpvoteModalComponent } =
    useUpvote({
      onSuccess: refetchProjects,
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

  useEffect(() => {
    if (allProjects.length > 0) {
      devLog('allProjects', allProjects);
    }
  }, [allProjects]);

  return (
    <div className="pb-10">
      <div className="mobile:flex-col mobile:gap-5 mt-5 flex items-start justify-between gap-10 px-2.5">
        <div className="w-full flex-1">
          <div className="border-b border-black/10 px-2.5 py-2 opacity-80">
            <ECFTypography type={'subtitle1'}>Recent Projects</ECFTypography>
          </div>

          {/* Project list */}
          <div className="pb-2.5">
            {isLoading ? (
              <>
                {Array.from({ length: 10 }).map((_, index) => (
                  <ProjectCardSkeleton key={index} showBorder={true} />
                ))}
              </>
            ) : allProjects.length > 0 ? (
              <>
                {allProjects.map((project) => {
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
                <ECFTypography type="subtitle1">
                  No Published Project Yet
                </ECFTypography>
              </div>
            )}
          </div>
        </div>

        <div className="mobile:hidden">
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
