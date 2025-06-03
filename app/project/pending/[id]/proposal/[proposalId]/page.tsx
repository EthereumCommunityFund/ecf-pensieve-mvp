'use client';

import { cn, Skeleton } from '@heroui/react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import BackHeader from '@/components/pages/project/BackHeader';
import SubmitProposalCard from '@/components/pages/project/proposal/common/SubmitProposalCard';
import ProposalDetailCard from '@/components/pages/project/proposal/detail/ProposalDetailCard';
import ProposalDetails from '@/components/pages/project/proposal/detail/ProposalDetails';
import UserWeightCard from '@/components/pages/project/proposal/detail/UserWeightCard';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import { IProject, IProposalWithVotes } from '@/types';
import { devLog } from '@/utils/devLog';
import ProposalVoteUtils from '@/utils/proposal';

const ProposalPage = () => {
  const { id: projectId, proposalId } = useParams();
  const router = useRouter();
  const { profile } = useAuth();

  const [isPageExpanded, setIsPageExpanded] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  const togglePageExpanded = useCallback(() => {
    setIsPageExpanded((pre) => !pre);
  }, []);

  const toggleFiltered = useCallback(() => {
    setIsFiltered((pre) => !pre);
  }, []);

  const { data: project, isFetched: isProjectFetched } =
    trpc.project.getProjectById.useQuery(
      { id: Number(projectId) },
      {
        enabled: !!projectId,
        select: (data) => {
          devLog('getProjectById', data);
          return data;
        },
      },
    );

  const { data: proposal, isFetched: isProposalFetched } =
    trpc.proposal.getProposalById.useQuery(
      { id: Number(proposalId) },
      {
        enabled: !!proposalId,
        select: (data) => {
          devLog('proposal', data);
          return data;
        },
      },
    );

  const proposals = useMemo(() => {
    return project?.proposals || [];
  }, [project?.proposals]);

  const { leadingProposalId } = useMemo(() => {
    return ProposalVoteUtils.getVoteResultOfProject({
      projectId: Number(projectId),
      proposals: proposals || [],
      votesOfProject: (
        (project?.proposals || []) as IProposalWithVotes[]
      ).flatMap((proposal) => proposal.voteRecords || []),
      userId: profile?.userId,
    });
  }, [proposals, projectId, profile?.userId, project?.proposals]);

  const onSubmitProposal = useCallback(() => {
    router.push(`/project/pending/${projectId}/proposal/create`);
  }, [router, projectId]);

  return (
    <div className=" pb-[20px]">
      <BackHeader>
        <div className="flex justify-start gap-[10px]">
          <span>Pending Projects</span>
          <span className="font-[600]">/</span>
          {isProjectFetched ? (
            <span>{project?.name}</span>
          ) : (
            <Skeleton className="h-[20px] w-[100px]" />
          )}
          <span className="font-[600]">/</span>
          {isProposalFetched ? (
            <span>Proposal {proposalId}</span>
          ) : (
            <Skeleton className="h-[20px] w-[100px]" />
          )}
        </div>
      </BackHeader>

      <ProposalDetailCard
        proposal={proposal}
        projectId={Number(projectId)}
        proposalIndex={Number(proposalId)}
        leadingProposalId={leadingProposalId}
      />

      {profile && (
        <div className="tablet:block mobile:block mx-[10px] mt-[10px] hidden">
          <UserWeightCard weight={Number(profile.weight)} />
        </div>
      )}

      <div
        className={cn(
          'mt-[20px] mx-auto flex justify-center items-start gap-[40px]',
          'tablet:flex-col tablet:gap-[20px] tablet:px-[20px] mobile:flex-col mobile:gap-[20px]',
          'tablet:px-[10px] mobile:px-[10px]',
          isPageExpanded ? 'px-[80px]' : '',
        )}
      >
        <div
          className={cn(
            'tablet:max-w-[9999px] mobile:max-w-[9999px] w-full flex-1',
            isPageExpanded ? '' : 'max-w-[820px]',
          )}
        >
          <ProposalDetails
            project={project as IProject}
            proposal={proposal}
            proposals={proposals || []}
            projectId={Number(projectId)}
            isPageExpanded={isPageExpanded}
            isFiltered={isFiltered}
            toggleExpanded={togglePageExpanded}
            toggleFiltered={toggleFiltered}
          />
        </div>

        <div
          className={cn(
            'tablet:w-full mobile:w-full flex w-[300px] flex-col gap-[20px]',
            isPageExpanded ? 'hidden' : '',
          )}
        >
          {profile && (
            <div className="tablet:hidden mobile:hidden">
              <UserWeightCard weight={Number(profile.weight)} />
            </div>
          )}
          <SubmitProposalCard
            onSubmitProposal={onSubmitProposal}
            showFullOnTablet={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ProposalPage;
