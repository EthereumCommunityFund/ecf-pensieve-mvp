'use client';

import { useMemo } from 'react';

import ECFTypography from '@/components/base/typography';
import { IProposal } from '@/types';
import { IVoteResultOfProposal } from '@/utils/proposal';

import ProposalListItem, { ProposalListItemSkeleton } from './ProposalListItem';

interface ProposalListProps {
  proposals: IProposal[];
  projectId: number;
  isLoading: boolean;
  isFetched: boolean;
  leadingProposalId?: number;
  leadingProposalResult?: IVoteResultOfProposal;
  voteResultOfProposalMap: Record<number, IVoteResultOfProposal>;
}

const ProposalList = ({
  proposals,
  projectId,
  isLoading,
  isFetched,
  leadingProposalId,
  leadingProposalResult,
  voteResultOfProposalMap,
}: ProposalListProps) => {
  const userVotedProposalIds = useMemo(() => {
    // TODO  获取用户投票记录 api
    return [] as number[];
  }, []);

  if (isLoading) {
    return (
      <div className="mt-[20px] flex flex-col gap-[20px]">
        {[1, 2, 3].map((index) => (
          <ProposalListItemSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!proposals || proposals.length === 0) {
    return (
      <div className="mt-[20px] rounded-[10px] border border-black/10 bg-white px-[20px] py-[100px] text-center">
        <ECFTypography type="body1">
          No proposal found in this project.
        </ECFTypography>
      </div>
    );
  }

  return (
    <div className="mt-[20px] flex flex-col gap-[20px]">
      {proposals.map((proposal, index) => (
        <ProposalListItem
          key={proposal.id}
          index={index}
          proposal={proposal}
          projectId={projectId}
          isLeading={proposal.id === leadingProposalId}
          hasVoted={true}
          // hasVoted={userVotedProposalIds.includes(proposal.id)}
          voteResultOfProposal={voteResultOfProposalMap[proposal.id]}
        />
      ))}
    </div>
  );
};

export default ProposalList;
