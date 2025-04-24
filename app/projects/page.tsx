'use client';

import { Image } from '@heroui/react';
import Link from 'next/link';

import { ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import ProjectCard from '@/components/pages/home/projectCard';
import RewardCard from '@/components/pages/project/rewardCard';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types/project';

const ProjectsPage = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    trpc.project.getProjects.useInfiniteQuery(
      {
        limit: 10,
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

  const handleProposeProject = () => {
    console.log('Propose a Project');
  };

  const allProjects = data?.pages.flatMap((page) => page.items) || [];

  return (
    <div className="pb-10">
      <div className="border-[rgba(0, 0, 0.1)] flex w-full items-start justify-start gap-5 rounded-[10px] border bg-white p-5">
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
          <Link href="/project/create">
            <ECFButton onPress={handleProposeProject} className="mt-2.5">
              Propose a Project
            </ECFButton>
          </Link>
        </div>
      </div>

      <div className="mt-5 flex items-start justify-between gap-10 px-2.5 mobile:flex-col mobile:gap-5">
        <div className="flex w-full items-center justify-end gap-2.5 lg:hidden pc:hidden tablet:hidden">
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

          {/* 项目列表 */}
          <div className="pb-2.5">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <ECFTypography type="body1">加载中...</ECFTypography>
              </div>
            ) : allProjects.length > 0 ? (
              <>
                {allProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project as IProject}
                    showBorder={true}
                  />
                ))}

                {/* 加载更多按钮 */}
                {hasNextPage && (
                  <div className="flex justify-center py-4">
                    <ECFButton
                      onPress={handleLoadMore}
                      isDisabled={isFetchingNextPage}
                      $size="small"
                    >
                      {isFetchingNextPage ? '加载中...' : '加载更多'}
                    </ECFButton>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-center py-8">
                <ECFTypography type="body1">暂无项目</ECFTypography>
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

        <div className="mt-5 w-full lg:hidden pc:hidden tablet:hidden">
          <RewardCard />
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
