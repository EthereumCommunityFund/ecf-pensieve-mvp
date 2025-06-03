'use client';

import { Image } from '@heroui/react';
import { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import ProjectCard, {
  ProjectCardSkeleton,
} from '@/components/pages/project/ProjectCard';
import RewardCard from '@/components/pages/project/RewardCardEntry';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';
import { devLog } from '@/utils/devLog';

const ProjectsPage = () => {
  const { profile, showAuthPrompt } = useAuth();
  const router = useRouter();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    trpc.project.getProjects.useInfiniteQuery(
      {
        limit: 10,
        isPublished: true,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

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
      <div className="flex w-full items-start justify-start gap-5 rounded-[10px] border border-[rgba(0,0,0,0.1)] bg-white p-5">
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

      <div className="mobile:flex-col mobile:gap-5 mt-5 flex items-start justify-between gap-10 px-2.5">
        <div className="pc:hidden tablet:hidden flex w-full items-center justify-end gap-2.5 lg:hidden">
          <ECFButton $size="small">Sort</ECFButton>
          <ECFButton $size="small">Filter</ECFButton>
        </div>

        <div className="flex-1">
          <div className="px-2.5 py-2 opacity-80">
            <ECFTypography type={'subtitle1'}>Recent Projects</ECFTypography>
            <ECFTypography type={'body2'} className="mt-[5px]">
              Page Completion Rate (Transparency) * User Supported Votes
            </ECFTypography>
          </div>

          {/* Project list */}
          <div className="pb-2.5">
            {isLoading ? (
              <>
                {Array.from({ length: 10 }).map((_, index) => (
                  <ProjectCardSkeleton key={index} />
                ))}
              </>
            ) : allProjects.length > 0 ? (
              <>
                {allProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project as IProject}
                    showBorder={true}
                  />
                ))}

                {isFetchingNextPage && <ProjectCardSkeleton />}

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
          <div className="flex h-[73px] w-[300px] items-start justify-start gap-5">
            <ECFButton $size="small" className="min-w-0 px-2.5">
              Sort
            </ECFButton>
            <ECFButton $size="small" className="min-w-0 px-2.5">
              Filter
            </ECFButton>
          </div>

          <RewardCard />
        </div>

        <div className="pc:hidden tablet:hidden mt-5 w-full lg:hidden">
          <RewardCard />
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
