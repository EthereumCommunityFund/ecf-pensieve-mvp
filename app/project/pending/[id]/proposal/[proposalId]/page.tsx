'use client';

import { cn, Skeleton } from '@heroui/react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useUserWeightModal } from '@/components/biz/modal/userWeightCard/Context';
import UserWeightCard from '@/components/biz/modal/userWeightCard/UserWeightCard';
import BackHeader from '@/components/pages/project/BackHeader';
import PublishingTip from '@/components/pages/project/proposal/common/PublishingTip';
import SubmitProposalCard from '@/components/pages/project/proposal/common/SubmitProposalCard';
import { useProposalDetailContext } from '@/components/pages/project/proposal/detail/context/proposalDetailContext';
import ProposalDetailCard from '@/components/pages/project/proposal/detail/ProposalDetailCard';
import ProposalDetails from '@/components/pages/project/proposal/detail/ProposalDetails';
import { useAuth } from '@/context/AuthContext';
import { IProposalWithVotes } from '@/types';
import ProposalVoteUtils from '@/utils/proposal';

const ProposalPage = () => {
  const { id: projectId, proposalId } = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const userId = profile?.userId;
  const { openUserWeightModal, setUserWeight } = useUserWeightModal();

  const { project, proposal, proposals, isProjectFetched, isProposalFetched } =
    useProposalDetailContext();

  // Set user weight to Context
  useEffect(() => {
    if (profile?.weight) {
      setUserWeight(Number(profile.weight));
    }
  }, [profile?.weight, setUserWeight]);

  useEffect(() => {
    if (project && project?.isPublished) {
      router.replace(`/project/${projectId}`);
    }
  }, [project, router, projectId]);

  const [isPageExpanded, setIsPageExpanded] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  const togglePageExpanded = useCallback(() => {
    setIsPageExpanded((pre) => !pre);
  }, []);

  const toggleFiltered = useCallback(() => {
    setIsFiltered((pre) => !pre);
  }, []);

  const {
    leadingProposalId,
    canBePublished,
    leadingProposal,
    votesOfProposalMap,
  } = useMemo(() => {
    return ProposalVoteUtils.getVoteResultOfProject({
      projectId: Number(projectId),
      proposals: proposals || [],
      votesOfProject: (
        (project?.proposals || []) as IProposalWithVotes[]
      ).flatMap((proposal) => proposal.voteRecords || []),
      userId: profile?.userId,
    });
  }, [proposals, projectId, profile?.userId, project?.proposals]);

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

  const proposalIndex = useMemo(() => {
    return proposals?.findIndex((p) => p.id === Number(proposalId));
  }, [proposals, proposalId]);

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
            <span>Proposal {proposalIndex + 1}</span>
          ) : (
            <Skeleton className="h-[20px] w-[100px]" />
          )}
        </div>
      </BackHeader>

      <ProposalDetailCard
        proposal={proposal}
        projectId={Number(projectId)}
        proposalIndex={proposalIndex}
        leadingProposalId={leadingProposalId}
      />

      {profile && (
        <div className="tablet:block mobile:block mx-[10px] mt-[10px] hidden">
          <UserWeightCard
            weight={Number(profile.weight)}
            onInfoClick={openUserWeightModal}
          />
        </div>
      )}

      {canBePublished && <PublishingTip classname={'tablet:mx-[10px]'} />}

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
            isPageExpanded={isPageExpanded}
            isFiltered={isFiltered}
            toggleExpanded={togglePageExpanded}
            toggleFiltered={toggleFiltered}
            proposalIndex={proposalIndex}
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
              <UserWeightCard
                weight={Number(profile.weight)}
                onInfoClick={openUserWeightModal}
              />
            </div>
          )}
          <SubmitProposalCard
            onSubmitProposal={onSubmitProposal}
            showFullOnTablet={true}
            canBePublished={canBePublished}
            latestVotingEndedAt={
              voteResultOfLeadingProposal?.latestVotingEndedAt || null
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ProposalPage;
