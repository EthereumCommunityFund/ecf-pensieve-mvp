'use client';

import { cn, Image, Skeleton } from '@heroui/react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';

import BackHeader from '@/components/pages/project/BackHeader';
import SubmitProposalCard from '@/components/pages/project/proposal/common/SubmitProposalCard';
import ProposalList from '@/components/pages/project/proposal/list/ProposalList';
// import ProjectCard from '@/components/pages/project/ProjectCard';
import { trpc } from '@/lib/trpc/client';
import { IProject, IProposal } from '@/types';
import { devLog } from '@/utils/devLog';

const ProjectPage = () => {
  const { id: projectId } = useParams();
  const router = useRouter();

  const {
    data: project,
    isLoading: isProjectLoading,
    isFetched: isProjectFetched,
  } = trpc.project.getProjectById.useQuery(
    { id: Number(projectId) },
    {
      enabled: !!projectId,
      select: (data) => {
        devLog('getProjectById', data);
        return data;
      },
    },
  );

  const {
    data: proposals,
    isLoading: isProposalsLoading,
    isFetched: isProposalsFetched,
  } = trpc.proposal.getProposalsByProjectId.useQuery(
    { projectId: Number(projectId) },
    {
      enabled: !!projectId,
      select: (data) => {
        devLog('getProposalsByProjectId', data);
        return data;
      },
    },
  );

  const onSubmitProposal = useCallback(() => {
    router.push(`/project/${projectId}/proposal/create`);
  }, [router, projectId]);

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

      <ProjectCard project={project} proposals={proposals} />

      {/* Proposal list */}
      <div
        className={cn(
          'mt-[20px] px-[160px] tablet:px-[10px] mobile:px-[10px] pt-[20px] ',
          'flex items-start justify-center gap-[40px] ',
          'tablet:flex-col mobile:flex-col tablet:gap-[20px] mobile:gap-[20px]',
        )}
      >
        <div className="tablet:max-w-[9999px] mobile:max-w-[9999px] w-full max-w-[800px] flex-1 ">
          <div className="font-mona flex items-center justify-between border-b border-black/10 bg-[rgba(245,245,245,0.80)] py-[8px] backdrop-blur-[5px]">
            <p className="text-[24px] font-[700] leading-[34px] text-black/80 ">
              Proposals
            </p>
            {isProposalsFetched ? (
              <span className="text-[20px] font-[700] leading-[28px] text-black/30">
                {proposals?.length || 0}
              </span>
            ) : (
              <Skeleton className="h-[28px] w-[40px]" />
            )}
          </div>

          <ProposalList
            proposals={proposals || []}
            projectId={Number(projectId)}
            isLoading={isProposalsLoading}
            isFetched={isProposalsFetched}
          />
        </div>

        <SubmitProposalCard onSubmitProposal={onSubmitProposal} />
      </div>
    </div>
  );
};

export default ProjectPage;

const ProjectCard = ({
  project,
  proposals,
}: {
  project?: IProject;
  proposals?: IProposal[];
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
          {/* TODO leading username */}
          <span className="text-black/60">@leo</span>
        </div>
      </div>
    </div>
  );
};
