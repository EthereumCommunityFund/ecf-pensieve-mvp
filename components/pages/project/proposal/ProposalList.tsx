'use client';

import { useMemo } from 'react';

import ECFTypography from '@/components/base/typography';
import { IProposal } from '@/types';

import ProposalListItem, { ProposalListItemSkeleton } from './ProposalListItem';

interface ProposalListProps {
  proposals: IProposal[];
  projectId: number;
  isLoading: boolean;
  isFetched: boolean;
}

const ProposalList = ({
  proposals,
  projectId,
  isLoading,
  isFetched,
}: ProposalListProps) => {
  const leadingProposalId = useMemo(() => {
    if (!proposals || proposals.length === 0) return null;
    return proposals[0].id;
  }, [proposals]);

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
      <div className="rounded-[10px] border border-black/10 bg-white p-[20px] text-center">
        <ECFTypography type="body1">
          No proposals found for this project.
        </ECFTypography>
      </div>
    );
  }

  return (
    <div className="mt-[20px] flex flex-col gap-[20px]">
      {proposals.map((proposal) => (
        <ProposalListItem
          key={proposal.id}
          proposal={proposal}
          projectId={projectId}
          isLeading={proposal.id === leadingProposalId}
          hasVoted={true}
          // hasVoted={userVotedProposalIds.includes(proposal.id)}
        />
      ))}
    </div>
  );
};

export default ProposalList;
