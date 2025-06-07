'use client';

import { cn, Image, Skeleton } from '@heroui/react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';

import BackHeader from '@/components/pages/project/BackHeader';
import SubmitProposalCard from '@/components/pages/project/proposal/common/SubmitProposalCard';
import ProposalList from '@/components/pages/project/proposal/list/ProposalList';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import { IProject, IProposal } from '@/types';
import { devLog } from '@/utils/devLog';
import ProposalVoteUtils from '@/utils/proposal';

const ProjectPage = () => {
  const { id: projectId } = useParams();
  const { profile } = useAuth();
  const userId = profile?.userId;
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

  useEffect(() => {
    if (project && project?.isPublished) {
      router.replace(`/project/${projectId}`);
    }
  }, [project?.isPublished, router, projectId]);

  const {
    data: proposals,
    isLoading: isProposalsLoading,
    isFetched: isProposalsFetched,
  } = trpc.proposal.getProposalsByProjectId.useQuery(
    { projectId: Number(projectId) },
    {
      enabled: !!projectId,
      select: (data) => {
        // devLog('getProposalsByProjectId', data);
        return data;
      },
    },
  );

  const {
    data: votesOfProject,
    isLoading: isVotesOfProjectLoading,
    isFetched: isVotesOfProjectFetched,
    isFetching: isVotesOfProjectFetching,
    refetch: refetchVotesOfProject,
  } = trpc.vote.getVotesByProjectId.useQuery(
    { projectId: Number(projectId) },
    {
      enabled: !!projectId,
      select: (data) => {
        devLog('getVotesByProjectId', data);
        return data;
      },
    },
  );

  const {
    leadingProposalId,
    leadingProposalResult,
    voteResultOfProposalMap,
    leadingProposal,
    canBePublished,
    votesOfProposalMap,
  } = useMemo(() => {
    return ProposalVoteUtils.getVoteResultOfProject({
      projectId: Number(projectId),
      votesOfProject: votesOfProject || [],
      proposals: proposals || [],
      userId,
    });
  }, [projectId, votesOfProject, proposals, userId]);

  const voteResultOfLeadingProposal = useMemo(() => {
    if (!leadingProposal) {
      return null;
    }
    return ProposalVoteUtils.getVoteResultOfProposal({
      proposalId: leadingProposal.id,
      votesOfProposal: votesOfProposalMap[leadingProposal.id],
      userId,
    });
  }, [leadingProposal, votesOfProposalMap, userId]);

  const onSubmitProposal = useCallback(() => {
    router.push(`/project/pending/${projectId}/proposal/create`);
  }, [router, projectId]);

  return (
    <div className="pb-[20px]">
      <BackHeader>
        <div className="flex justify-start gap-[10px]">
          <span>Pending Projects</span>
          <span className="font-[600]">/</span>
          {isProjectFetched ? (
            <span>{project?.name}</span>
          ) : (
            <Skeleton className="h-[20px] w-[100px]" />
          )}
        </div>
      </BackHeader>

      <ProjectCard
        project={project as IProject}
        proposals={proposals}
        leadingProposal={leadingProposal}
        canBePublished={canBePublished}
      />

      {/* Proposal list */}
      <div
        className={cn(
          'mt-[20px] px-[160px] tablet:px-[20px] mobile:px-[10px] pt-[20px] ',
          'flex items-start justify-center gap-[40px] ',
          'mobile:flex-col mobile:gap-[20px]',
        )}
      >
        <div className="mobile:max-w-[9999px] w-full max-w-[800px] flex-1 ">
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
            leadingProposalId={leadingProposalId}
            leadingProposalResult={leadingProposalResult}
            voteResultOfProposalMap={voteResultOfProposalMap}
          />
        </div>

        <SubmitProposalCard
          onSubmitProposal={onSubmitProposal}
          canBePublished={canBePublished}
          latestVotingEndedAt={
            voteResultOfLeadingProposal?.latestVotingEndedAt || null
          }
        />
      </div>
    </div>
  );
};

export default ProjectPage;

const ProjectCard = ({
  project,
  proposals,
  leadingProposal,
  canBePublished,
}: {
  project?: IProject;
  proposals?: IProposal[];
  leadingProposal?: IProposal;
  canBePublished?: boolean;
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
        className="shrink-0 overflow-hidden rounded-[10px] border border-black/10 object-cover"
      />
      <div className="flex flex-1 flex-col gap-[10px]">
        <p className="text-[20px] font-[700] leading-tight text-[#202023]">
          {project.name}
        </p>
        <p className="text-[14px] font-[400] leading-[1.66] text-[#202023]">
          {project.tagline}
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
          {!!leadingProposal && (
            <>
              <span className="text-black/20">|</span>
              {/* when reach 100%, use `winner` */}
              <span>{canBePublished ? 'Winner' : 'Leading'}:</span>
              <span className="text-black/60">
                @{leadingProposal.creator.name}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
