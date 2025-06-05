'use client';

import { Image } from '@heroui/react';
import { useRouter } from 'next/navigation';

import { Button, ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import PendingProjectCard, {
  PendingProjectCardSkeleton,
} from '@/components/pages/project/PendingProjectCard';
import { ProjectCardSkeleton } from '@/components/pages/project/ProjectCard';
import ProposalRequirements from '@/components/pages/project/ProposalRequirements';
import RewardCard from '@/components/pages/project/RewardCardEntry';
import ScanPendingProject from '@/components/pages/ScanPendingProject';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';
import { devLog } from '@/utils/devLog';

const PendingProjectsPage = () => {
  const router = useRouter();
  const { profile, showAuthPrompt } = useAuth();

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
    if (!profile) {
      showAuthPrompt();
      return;
    }
    router.push('/project/create');
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
            <Button
              onPress={handleProposeProject}
              className="font-mona border-none bg-[#64C0A5] px-[20px] text-[16px] text-white hover:bg-[#6ab9a1]"
            >
              Propose a Project
            </Button>
            {/* TODO click logic */}
            <Button className="font-mona px-[20px] text-[16px]">
              How it works
            </Button>
            <ScanPendingProject />
          </div>
        </div>
      </div>

      <div className="mobile:flex-col mobile:gap-5 mt-5 flex items-start justify-between gap-10 px-2.5">
        <div className="pc:hidden tablet:hidden flex w-full items-center justify-end gap-2.5 lg:hidden">
          <ECFButton $size="small">Sort</ECFButton>
          <ECFButton $size="small">Filter</ECFButton>
        </div>

        <div className="mobile:w-full flex-1">
          <div className="px-2.5 py-2 opacity-80">
            <ECFTypography type={'subtitle1'}>
              Recent Pending Projects
            </ECFTypography>
          </div>

          {/* Project list */}
          <div className="pb-2.5">
            {isLoading ? (
              <>
                {Array.from({ length: 10 }).map((_, index) => (
                  <PendingProjectCardSkeleton key={index} />
                ))}
              </>
            ) : allProjects.length > 0 ? (
              <>
                {allProjects.map((project) => (
                  <PendingProjectCard
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

          <div className="flex flex-col gap-[20px]">
            <ProposalRequirements />

            <RewardCard />
          </div>
        </div>

        <div className="mobile:flex mobile:flex-col hidden w-full gap-[20px]">
          <ProposalRequirements />
          <RewardCard />
        </div>
      </div>
    </div>
  );
};

export default PendingProjectsPage;
