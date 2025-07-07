'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { ProjectListWrapper } from '@/components/pages/home/HomeList';
import BackHeader from '@/components/pages/project/BackHeader';
import RewardCard from '@/components/pages/project/RewardCardEntry';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';
import { devLog } from '@/utils/devLog';

const ProjectsPage = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');

  const {
    data: ranksData,
    isLoading,
    refetch: refetchProjects,
  } = trpc.rank.getTopRanks.useQuery();

  // Get the appropriate project list based on type
  const { projectList, title, description, emptyMessage } = useMemo(() => {
    if (type === 'transparent') {
      return {
        projectList:
          ranksData?.byGenesisWeight?.map((rank: any) => rank.project) || [],
        title: 'Top Transparent Projects',
        description: `Completion rate = sum of published items' genesis itemweight / sum of items' itemweight (fixed across projects)`,
        emptyMessage: 'No transparent projects found',
      };
    } else if (type === 'community-trusted') {
      return {
        projectList: ranksData?.bySupport || [],
        title: 'Top Community-trusted',
        description: `Projects are ranked based on the total amount of staked upvotes received from users. This reflects community recognition and perceived value`,
        emptyMessage: 'No community-trusted projects found',
      };
    }
    // Default fallback
    return {
      projectList: [],
      title: 'Top Projects',
      description: 'Please specify a valid type parameter',
      emptyMessage: 'Please specify a valid type parameter',
    };
  }, [type, ranksData]);

  useEffect(() => {
    if (projectList.length > 0) {
      devLog('projectList', projectList);
    }
  }, [projectList]);

  return (
    <div className="pb-10">
      <BackHeader className="px-[10px]" />
      <div className="mobile:flex-col mobile:gap-5 mt-5 flex items-start justify-between gap-10 px-2.5">
        <div className="w-full flex-1">
          {/* Header with title and description */}
          <div className="border-b border-black/10 px-2.5 py-4">
            <h1 className="text-[24px] font-[700] leading-[1.4] text-black/80">
              {title}
            </h1>
            <p className="mt-[5px] text-[14px] font-[400] leading-[19px] text-black/60">
              {description}
            </p>
          </div>

          {/* Project list */}
          <ProjectListWrapper
            isLoading={isLoading}
            projectList={projectList as IProject[]}
            onRefetch={refetchProjects}
            emptyMessage={emptyMessage}
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

export default ProjectsPage;
