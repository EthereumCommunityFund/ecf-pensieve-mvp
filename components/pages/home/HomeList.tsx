'use client';

import Link from 'next/link';
import React from 'react';

import { ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';

import { ProjectCardSkeleton } from '../project/ProjectCard';

import ProjectListWithUpvote from './ProjectListWithUpvote';

interface ISectionProps {
  title: string;
  description: string;
  buttonText?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const SectionList = (props: ISectionProps) => {
  return (
    <div>
      <div
        className="mobile:h-auto mobile:flex-col mobile:items-start mobile:gap-2.5
				mt-5 flex
				items-center justify-between
				px-[20px]"
      >
        <div className="mobile:h-auto">
          <ECFTypography type={'subtitle1'} className="font-bold opacity-80">
            {props.title}
          </ECFTypography>
          {props.description && (
            <ECFTypography
              type={'body2'}
              className="mt-[5px] font-normal leading-[19px] opacity-80"
            >
              {props.description}
            </ECFTypography>
          )}
        </div>
        {props.buttonText && (
          <Link href="/projects">
            <ECFButton
              $size={'small'}
              onPress={props.onClick}
              className="mobile:h-[31px] mobile:w-full h-[31px] px-2.5"
            >
              {props.buttonText}
            </ECFButton>
          </Link>
        )}
      </div>
      {props.children}
    </div>
  );
};

const HomeList = () => {
  const {
    data: ranksData,
    isLoading,
    refetch: refetchProjects,
  } = trpc.rank.getTopRanks.useQuery();

  const viewAllProject = () => {
    console.log('view all project');
  };

  const byGenesisProjects =
    ranksData?.byGenesisWeight?.map((rank: any) => rank.project) || [];
  const bySupportProjects = ranksData?.bySupport || [];

  return (
    <div className="mt-5">
      <SectionList
        title="Top Transparent Projects"
        description={`Published Projects are ranked by their completion rate, defined as: completion rate = sum of of published items's genesis itemweight / total sum of all form items' itemweight`}
        buttonText="View All Projects"
        onClick={viewAllProject}
      >
        {isLoading ? (
          <div className="mt-2.5 px-[10px]">
            <ProjectCardSkeleton showBorder={true} />
            <ProjectCardSkeleton showBorder={true} />
            <ProjectCardSkeleton showBorder={false} />
          </div>
        ) : byGenesisProjects.length > 0 ? (
          <ProjectListWithUpvote
            projectList={byGenesisProjects as IProject[]}
            onRefetch={refetchProjects}
          />
        ) : (
          <div className="flex justify-center py-8">
            <ECFTypography type="body1">No projects yet</ECFTypography>
          </div>
        )}
      </SectionList>
      <SectionList
        title={`Community’s Pick Projects`}
        description={`Projects are ranked based on the total amount of staked upvotes received from users. This reflects community recognition and perceived value`}
      >
        {isLoading ? (
          <div className="mt-2.5 px-[10px]">
            <ProjectCardSkeleton showBorder={true} />
            <ProjectCardSkeleton showBorder={true} />
            <ProjectCardSkeleton showBorder={false} />
          </div>
        ) : bySupportProjects.length > 0 ? (
          <ProjectListWithUpvote
            projectList={bySupportProjects as IProject[]}
            onRefetch={refetchProjects}
          />
        ) : (
          <div className="flex justify-center py-8">
            <ECFTypography type="body1">No projects yet</ECFTypography>
          </div>
        )}
      </SectionList>
      <SectionList
        title="Top Accountable Projects"
        description="LIST COMING SOON"
      />
      <SectionList
        title="Top Privacy Projects"
        description="LIST COMING SOON"
      />
    </div>
  );
};

export default HomeList;
