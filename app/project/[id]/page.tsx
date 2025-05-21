'use client';

import { cn, Image, Skeleton, Tab, Tabs } from '@heroui/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import ECFTypography from '@/components/base/typography';
import BackHeader from '@/components/pages/project/BackHeader';
import { useProjectDetail } from '@/components/pages/project/context/projectDetail';
import ContributeButton from '@/components/pages/project/detail/ContributeButton';
import Ecosystem from '@/components/pages/project/detail/Ecosystem';
import Profile from '@/components/pages/project/detail/Profile';
import Review from '@/components/pages/project/detail/Review';
import ProjectData from '@/components/pages/project/ProjectData';
import { useAuth } from '@/context/AuthContext';
import { IProject, IProposal } from '@/types';

const tabItems = [
  { key: 'project-data', label: 'Project Data' },
  { key: 'ecosystem', label: 'Ecosystem' },
  { key: 'profile', label: 'Profile' },
  { key: 'review', label: 'Review' },
];

type TabKey = 'project-data' | 'ecosystem' | 'profile' | 'review';

const ProjectPage = () => {
  const { id: projectId } = useParams();
  const { profile } = useAuth();
  const userId = profile?.userId;
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab');

  // 使用 Context 获取项目数据
  const {
    project,
    proposals,
    isProjectFetched,
    isProposalsLoading,
    isProposalsFetched,
  } = useProjectDetail();

  const [activeTab, setActiveTab] = useState<TabKey>(
    initialTab === 'ecosystem' ||
      initialTab === 'profile' ||
      initialTab === 'review'
      ? initialTab
      : 'project-data',
  );

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (
      currentTab &&
      (currentTab === 'project-data' ||
        currentTab === 'ecosystem' ||
        currentTab === 'profile' ||
        currentTab === 'review')
    ) {
      setActiveTab(currentTab as TabKey);
    } else if (!currentTab) {
      router.push(`/project/${projectId}?tab=project-data`, { scroll: false });
    }
  }, [searchParams, projectId, router]);

  const onSubmitProposal = useCallback(() => {
    router.push(`/project/pending/${projectId}/proposal/create`);
  }, [router, projectId]);

  const handleContribute = useCallback(() => {
    // 处理贡献按钮点击事件
    console.log('Contribute button clicked');
  }, []);

  return (
    <div className="pb-[20px]">
      <BackHeader>
        <div className="flex justify-start gap-[10px]">
          <span>Projects</span>
          <span className="font-[600]">/</span>
          {isProjectFetched ? (
            <span>{project?.name}</span>
          ) : (
            <Skeleton className="h-[20px] w-[100px]" />
          )}
        </div>
      </BackHeader>

      {/* <ProjectCard
        project={project as IProject}
        proposals={proposals}
        leadingProposal={leadingProposal}
      /> */}

      <div className="tablet:px-[10px] mobile:px-[10px]  mt-[20px] px-[20px]">
        <div className="flex items-center justify-between">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => {
              const newTab = key as TabKey;
              setActiveTab(newTab);
              router.push(`/project/${projectId}?tab=${newTab}`, {
                scroll: false,
              });
            }}
            variant="underlined"
            // className="w-full"
            classNames={{
              tabList: 'w-full border-b border-[rgba(0,0,0,0.1)] gap-[20px]',
              tab: 'w-fit flex justify-start items-center',
              cursor:
                'bg-black w-[102%] bottom-[-4px] left-[-4px] right-[-4px]',
              tabContent: 'font-semibold',
            }}
          >
            {tabItems.map(({ key, label }) => (
              <Tab
                key={key}
                title={
                  <ECFTypography
                    type="body1"
                    className={cn(
                      'font-semibold',
                      activeTab === key ? 'opacity-100' : 'opacity-60',
                    )}
                  >
                    {label}
                  </ECFTypography>
                }
              />
            ))}
          </Tabs>
          <ContributeButton onClick={handleContribute} />
        </div>
      </div>

      {activeTab === 'project-data' && (
        <ProjectData
          projectId={Number(projectId)}
          proposals={proposals}
          isProposalsLoading={isProposalsLoading}
          isProposalsFetched={isProposalsFetched}
          onSubmitProposal={onSubmitProposal}
        />
      )}
      {activeTab === 'ecosystem' && <Ecosystem projectId={Number(projectId)} />}
      {activeTab === 'profile' && <Profile projectId={Number(projectId)} />}
      {activeTab === 'review' && <Review projectId={Number(projectId)} />}
    </div>
  );
};

export default ProjectPage;

const ProjectCard = ({
  project,
  proposals,
  leadingProposal,
}: {
  project?: IProject;
  proposals?: IProposal[];
  leadingProposal?: IProposal;
}) => {
  if (!project) {
    return (
      <div
        className={cn(
          'mt-[10px] mx-[20px] mobile:mx-[10px]',
          'p-[20px] mobile:p-[14px]',
          'bg-white border border-black/10 rounded-[10px]',
          'flex justify-start items-start gap-[20px]',
        )}
      >
        <Skeleton className="size-[100px] overflow-hidden rounded-[10px] border border-black/10" />

        <div className="flex flex-1 flex-col gap-[10px]">
          <Skeleton className="h-[25px] w-[180px]" />
          <Skeleton className="h-[23px] w-full" />

          <div className="flex flex-wrap gap-[8px]">
            {[1, 2, 3].map((index) => {
              return (
                <Skeleton
                  key={index}
                  className="h-[22px] w-[60px] rounded-[6px]"
                />
              );
            })}
          </div>

          <div className="flex items-center justify-start gap-[10px]">
            <Skeleton className="h-[20px] w-[110px]" />
            <Skeleton className="h-[20px] w-[16px]" />
            <span className="text-black/20">|</span>
            <Skeleton className="h-[20px] w-[60px]" />
            <Skeleton className="h-[20px] w-[120px]" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className={cn(
        'mt-[10px] mx-[20px] mobile:mx-[10px]',
        'p-[20px] mobile:p-[14px]',
        'bg-white border border-black/10 rounded-[10px]',
        'flex justify-start items-start gap-[20px]',
      )}
    >
      <Image
        src={project.logoUrl}
        alt={project.name}
        width={100}
        height={100}
        className="overflow-hidden rounded-[10px] border border-black/10 object-cover"
      />
      <div className="flex flex-col gap-[10px]">
        <p className="text-[20px] font-[700] leading-tight text-[#202023]">
          {project.name}
        </p>
        <p className="text-[14px] font-[400] leading-[1.66] text-[#202023]">
          {project.mainDescription}
        </p>
        <div className="flex flex-wrap gap-[8px]">
          {project.categories.map((category) => {
            return (
              <span
                key={category}
                className="flex h-[22px] items-center rounded-[6px] bg-black/5 px-[12px] text-[12px] font-[600] leading-none text-black"
              >
                {category}
              </span>
            );
          })}
        </div>
        <div className="flex items-center gap-[10px] text-[14px] font-[600] text-black">
          <span>Total Proposals: </span>
          <span className="text-black/60">{proposals?.length || 0}</span>
          <span className="text-black/20">|</span>
          <span>Leading:</span>
          {leadingProposal && (
            <span className="text-black/60">
              @{leadingProposal.creator.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
