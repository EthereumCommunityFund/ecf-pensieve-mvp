'use client';

import { Image } from '@heroui/react';
import Link from 'next/link';

import { Button, ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import PendingProjectCard, {
  PendingProjectCardSkeleton,
} from '@/components/pages/project/PendingProjectCard';
import { ProjectCardSkeleton } from '@/components/pages/project/ProjectCard';
import RewardCard from '@/components/pages/project/RewardCardEntry';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import { devLog } from '@/utils/devLog';

const PendingProjectsPage = () => {
  const { profile } = useAuth();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    trpc.project.getProjects.useInfiniteQuery(
      {
        limit: 10,
        isPublished: false,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        select: (data) => {
          devLog('getProjects', data);
          return data;
        },
      },
    );

  const handleLoadMore = () => {
    if (!isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleProposeProject = () => {
    console.log('Propose a Project');
  };

  const allProjects = data?.pages.flatMap((page) => page.items) || [];

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
          <ECFTypography type={'title'}>Pending Projects</ECFTypography>
          <ECFTypography type={'subtitle2'} className="mt-[10px]">
            Explore projects and initiatives here or add your own to the list!
          </ECFTypography>
          <div className="mt-[20px] flex items-center justify-start gap-[10px]">
            <Link href="/project/create">
              <Button
                onPress={handleProposeProject}
                className="font-mona border-none bg-[#64C0A5] px-[20px] text-[16px] text-white hover:bg-[#6ab9a1]"
              >
                Propose a Project
              </Button>
            </Link>
            {/* TODO click logic */}
            <Button className="font-mona px-[20px] text-[16px]">
              How it works
            </Button>
          </div>
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
              <div>
                <PendingProjectCardSkeleton />
                <PendingProjectCardSkeleton />
                <PendingProjectCardSkeleton />
              </div>
            ) : allProjects.length > 0 ? (
              <>
                {allProjects.map((project) => (
                  <PendingProjectCard
                    key={project.id}
                    project={project}
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
              <div className="flex justify-center py-8">
                <ECFTypography type="body1">No projects yet</ECFTypography>
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

export default PendingProjectsPage;
