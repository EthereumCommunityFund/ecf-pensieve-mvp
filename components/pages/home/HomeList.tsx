'use client';

import Link from 'next/link';
import React from 'react';

import { ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';

import { ProjectCardSkeleton } from '../project/ProjectCard';

import ProjectList from './ProjectList';

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
  const { data: projectsData, isLoading } = trpc.project.getProjects.useQuery({
    limit: 10,
    isPublished: true,
  });

  const viewAllProject = () => {
    console.log('view all project');
  };

  const projects = projectsData?.items || [];

  return (
    <div className="mt-5">
      <SectionList
        title="Recent Projects"
        description=""
        buttonText="View All Projects"
        onClick={viewAllProject}
      >
        {isLoading ? (
          <div className="mt-2.5 px-[10px]">
            <ProjectCardSkeleton showBorder={true} />
            <ProjectCardSkeleton showBorder={true} />
            <ProjectCardSkeleton showBorder={false} />
          </div>
        ) : projects.length > 0 ? (
          <ProjectList projectList={projects as IProject[]} />
        ) : (
          <div className="flex justify-center py-8">
            <ECFTypography type="body1">No projects yet</ECFTypography>
          </div>
        )}
      </SectionList>
      <SectionList title="Top Secure Projects" description="LIST COMING SOON" />
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
