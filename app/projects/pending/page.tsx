'use client';

import { Image } from '@heroui/react';
import { PlusCircle } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Button, ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import PendingProjectCard, {
  PendingProjectCardSkeleton,
} from '@/components/pages/project/PendingProjectCard';
import ProposalRequirements from '@/components/pages/project/ProposalRequirements';
import RewardCard from '@/components/pages/project/RewardCardEntry';
import ScanPendingProject from '@/components/pages/ScanPendingProject';
import { useAuth } from '@/context/AuthContext';
import { useExternalLink } from '@/context/ExternalLinkContext';
import { useOffsetPagination } from '@/hooks/useOffsetPagination';
import { trpc } from '@/lib/trpc/client';
import type { IProject } from '@/types';

const PAGE_SIZE = 10;

const PendingProjectsPage = () => {
  const router = useRouter();
  const { profile, showAuthPrompt } = useAuth();
  const { openExternalLink } = useExternalLink();

  const {
    offset,
    items: projectList,
    isLoadingMore,
    handleLoadMore,
    setPageData,
  } = useOffsetPagination<IProject>({ pageSize: PAGE_SIZE });

  const { data, isLoading } = trpc.project.getProjects.useQuery({
    limit: PAGE_SIZE,
    offset,
    isPublished: false,
  });

  const handleProposeProject = () => {
    if (!profile) {
      showAuthPrompt();
      return;
    }
    router.push('/project/create');
  };

  // Manage accumulated projects list
  useEffect(() => {
    if (data?.items) {
      setPageData(data.items as IProject[], data.offset ?? offset);
    }
  }, [data, offset, setPageData]);

  return (
    <div className="pb-10">
      <div className="flex w-full items-start justify-start gap-5 rounded-[10px] border border-[rgba(0,0,0,0.1)] bg-white p-5">
        <div className="size-[63px] shrink-0">
          <Image
            src="/images/projects/logo.png"
            alt="ECF project Logo"
            width={63}
            height={63}
          />
        </div>

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
            <ECFButton
              onPress={() =>
                openExternalLink('https://ecf-pensieve-ai.vercel.app/')
              }
              className="border border-black/10 bg-transparent font-semibold hover:bg-black/5 focus:bg-black/5 active:bg-black/10"
            >
              <PlusCircle className="size-[20px] opacity-50" />
              <span>Pensieve Magic Pen</span>
            </ECFButton>
            <ScanPendingProject />
          </div>
        </div>
      </div>

      <div className="mobile:flex-col mobile:gap-5 mt-5 flex items-start justify-between gap-10 px-2.5">
        <div className="mobile:w-full flex-1">
          <div className="border-b border-black/10 px-2.5 py-2 opacity-80">
            <ECFTypography type={'subtitle1'}>
              Recent Pending Projects
            </ECFTypography>
          </div>

          {/* Project list */}
          <div className="pb-2.5">
            {isLoading && offset === 0 ? (
              <>
                {Array.from({ length: 10 }).map((_, index) => (
                  <PendingProjectCardSkeleton key={index} />
                ))}
              </>
            ) : projectList.length > 0 ? (
              <>
                {projectList.map((project) => (
                  <PendingProjectCard
                    key={project.id}
                    project={project}
                    showBorder={true}
                  />
                ))}

                {isLoadingMore && (
                  <div>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <PendingProjectCardSkeleton key={`loading-${index}`} />
                    ))}
                  </div>
                )}

                {data?.hasNextPage && (
                  <div className="flex justify-center py-4">
                    <ECFButton
                      onPress={handleLoadMore}
                      isDisabled={isLoadingMore}
                      $size="small"
                    >
                      {isLoadingMore ? 'Loading...' : 'Load More'}
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
