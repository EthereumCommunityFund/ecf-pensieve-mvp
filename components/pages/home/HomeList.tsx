'use client';

import { useRouter } from 'next/navigation';
import React, { useCallback } from 'react';

import { Button } from '@/components/base/button';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';
import { formatDateWithTimeGMT } from '@/utils/formatters';

import { ProjectCardSkeleton } from '../project/ProjectCard';

import ProjectListWithUpvote from './ProjectListWithUpvote';

interface ISectionProps {
  title: string;
  description: string;
  buttonText?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  updatedAt?: Date | string | null;
}

const SectionHeader = (props: ISectionProps) => {
  return (
    <div className="tablet:items-start mobile:items-start flex flex-1 items-center justify-between gap-[10px] px-[10px] py-[4px]">
      <div className="">
        <p className="tablet:text-[18px] mobile:text-[18px] text-[24px] font-[700] leading-[1.4] text-black/80">
          {props.title}
        </p>
        {props.description && (
          <p className="mt-[5px] text-[14px] font-[400] leading-[19px] text-black/60">
            {props.description}
          </p>
        )}
        {props.updatedAt && (
          <p className="mt-[5px] text-[10px] font-[400] leading-[14px] text-black/60">
            Updated:{' '}
            {formatDateWithTimeGMT(props.updatedAt, 'DD-MM-YYYY | HH:mm')} GMT
          </p>
        )}
      </div>
      {props.buttonText && (
        <div className="">
          <Button size="sm" onPress={props.onClick} className="font-[400]">
            {props.buttonText}
          </Button>
        </div>
      )}
    </div>
  );
};

export const ProjectListWrapper = ({
  isLoading,
  projectList,
  onRefetch,
  viewAllButtonText,
  viewAllButtonOnPress,
  emptyMessage,
}: {
  isLoading: boolean;
  projectList: IProject[];
  onRefetch: () => void;
  viewAllButtonText?: string;
  viewAllButtonOnPress?: () => void;
  emptyMessage?: string;
}) => {
  return (
    <div className="flex-1">
      {isLoading ? (
        <div className="mt-2.5 px-[10px]">
          <ProjectCardSkeleton showBorder={true} />
          <ProjectCardSkeleton showBorder={true} />
          <ProjectCardSkeleton showBorder={true} />
          <ProjectCardSkeleton showBorder={true} />
          <ProjectCardSkeleton showBorder={false} />
        </div>
      ) : projectList.length > 0 ? (
        <>
          <ProjectListWithUpvote
            projectList={projectList as IProject[]}
            onRefetch={onRefetch}
          />
          {viewAllButtonText && viewAllButtonOnPress && (
            <div className="mt-[10px] px-[10px]">
              <Button
                size="sm"
                onPress={viewAllButtonOnPress}
                className="w-full border-none bg-black/5 "
              >
                {viewAllButtonText}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex justify-center py-8">
          <p className="text-[16px] font-[400] leading-[22px] text-black/60">
            {emptyMessage || 'No projects yet'}
          </p>
        </div>
      )}
    </div>
  );
};

const HomeList = () => {
  const router = useRouter();
  const limit = 5;
  const {
    data: ranksData,
    isLoading,
    refetch: refetchProjects,
  } = trpc.rank.getTopRanks.useQuery();

  const viewAllProject = () => {
    console.log('view all project');
  };

  const byGenesisProjects =
    ranksData?.byGenesisWeight
      ?.map((rank: any) => rank.project)
      .slice(0, limit) || [];
  const bySupportProjects = ranksData?.bySupport?.slice(0, limit) || [];

  // Get the latest updatedAt time from all ranks for transparent projects
  const transparentProjectsUpdatedAt = ranksData?.byGenesisWeight?.reduce(
    (latest, rank) => {
      if (!rank.updatedAt) return latest;
      if (!latest) return rank.updatedAt;
      return new Date(rank.updatedAt) > new Date(latest)
        ? rank.updatedAt
        : latest;
    },
    null as Date | null,
  );

  // Get the latest updatedAt time from all projects for community-trusted projects
  const communityTrustedUpdatedAt = ranksData?.bySupport?.reduce(
    (latest, project) => {
      if (!project.updatedAt) return latest;
      if (!latest) return project.updatedAt;
      return new Date(project.updatedAt) > new Date(latest)
        ? project.updatedAt
        : latest;
    },
    null as Date | null,
  );

  const handleViewTopTransparentProjects = useCallback(() => {
    router.push('/projects?type=transparent');
  }, [router]);

  const handleViewTopCommunityTrustedProjects = useCallback(() => {
    router.push('/projects?type=community-trusted');
  }, [router]);

  return (
    <div className="tablet:gap-[10px] mt-5 flex flex-col gap-[20px]">
      <div className="mobile:hidden">
        <div className="tablet:gap-[10px] flex items-start justify-between gap-[20px]">
          <SectionHeader
            title="Top Transparent Projects"
            description={`Completion rate = sum of published items' genesis itemweight / sum of items' itemweight (fixed across projects)`}
            buttonText="View All Top"
            onClick={handleViewTopTransparentProjects}
            updatedAt={transparentProjectsUpdatedAt}
          />
          <SectionHeader
            title={`Top Community-trusted`}
            description={`Projects are ranked based on the total amount of staked upvotes received from users. This reflects community recognition and perceived value`}
            buttonText="View All Top"
            onClick={handleViewTopCommunityTrustedProjects}
            updatedAt={communityTrustedUpdatedAt}
          />
        </div>
        <div className="tablet:gap-[10px] flex items-start justify-between gap-[20px]">
          <ProjectListWrapper
            isLoading={isLoading}
            projectList={byGenesisProjects as IProject[]}
            onRefetch={refetchProjects}
            viewAllButtonText="View More Transparent"
            viewAllButtonOnPress={handleViewTopTransparentProjects}
          />
          <ProjectListWrapper
            isLoading={isLoading}
            projectList={bySupportProjects as IProject[]}
            onRefetch={refetchProjects}
            viewAllButtonText="View More Community-trusted"
            viewAllButtonOnPress={handleViewTopCommunityTrustedProjects}
          />
        </div>
      </div>

      <div className="mobile:flex hidden flex-col gap-[10px]">
        <div className="">
          <SectionHeader
            title="Top Transparent Projects"
            description={`Completion rate = sum of published items' genesis itemweight / sum of items' itemweight (fixed across projects)`}
            buttonText="View All Top"
            onClick={handleViewTopTransparentProjects}
            updatedAt={transparentProjectsUpdatedAt}
          />
          <ProjectListWrapper
            isLoading={isLoading}
            projectList={byGenesisProjects as IProject[]}
            onRefetch={refetchProjects}
            viewAllButtonText="View More Transparent"
            viewAllButtonOnPress={handleViewTopTransparentProjects}
          />
        </div>
        <div className="">
          <SectionHeader
            title={`Top Community-trusted`}
            description={`Projects are ranked based on the total amount of staked upvotes received from users. This reflects community recognition and perceived value`}
            buttonText="View All Top"
            onClick={handleViewTopCommunityTrustedProjects}
            updatedAt={communityTrustedUpdatedAt}
          />
          <ProjectListWrapper
            isLoading={isLoading}
            projectList={bySupportProjects as IProject[]}
            onRefetch={refetchProjects}
            viewAllButtonText="View More Community-trusted"
            viewAllButtonOnPress={handleViewTopCommunityTrustedProjects}
          />
        </div>
      </div>

      <SectionHeader
        title="Top Accountable Projects"
        description="LIST COMING SOON"
      />
      <SectionHeader
        title="Top Privacy Projects"
        description="LIST COMING SOON"
      />
    </div>
  );
};

export default HomeList;
