'use client';

import Link from 'next/link';

import { ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types/project';

import ProjectList from './projectList';

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
        className="mt-5 flex h-[65px] items-center
				justify-between px-[20px] mobile:h-auto
				mobile:flex-col mobile:items-start
				mobile:gap-2.5"
      >
        <div className="h-[57px] mobile:h-auto">
          <ECFTypography type={'subtitle1'} className="font-bold opacity-80">
            {props.title}
          </ECFTypography>
          <ECFTypography
            type={'body2'}
            className="mt-[5px] font-normal leading-[19px] opacity-80"
          >
            {props.description}
          </ECFTypography>
        </div>
        {props.buttonText && (
          <Link href="/projects">
            <ECFButton
              $size={'small'}
              onPress={props.onClick}
              className="h-[31px] px-2.5 mobile:h-[31px] mobile:w-full"
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
  });

  const viewAllProject = () => {
    console.log('view all project');
  };

  const projects = projectsData?.items || [];

  return (
    <div className="mt-5">
      <SectionList
        title="Top Transparent Projects"
        description="Page Completion Rate (Transparency) * User Supported Votes"
        buttonText="View All Projects"
        onClick={viewAllProject}
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <ECFTypography type="body1">加载中...</ECFTypography>
          </div>
        ) : projects.length > 0 ? (
          <ProjectList projectList={projects as IProject[]} />
        ) : (
          <div className="flex justify-center py-8">
            <ECFTypography type="body1">暂无项目</ECFTypography>
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
