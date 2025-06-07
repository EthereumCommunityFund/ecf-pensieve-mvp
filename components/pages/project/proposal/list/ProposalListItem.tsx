'use client';

import { Skeleton } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { Button } from '@/components/base';
import { InfoIcon } from '@/components/icons';
import {
  ESSENTIAL_ITEM_QUORUM_SUM,
  ESSENTIAL_ITEM_WEIGHT_SUM,
} from '@/lib/constants';
import { IProposal } from '@/types';
import { IVoteResultOfProposal } from '@/utils/proposal';

import ProgressLine from '../../ProgressLine';
import { ActiveLeadingLabel } from '../common/LeadingLabel';
import VotedLabel from '../common/VotedLabel';

interface ProposalListItemProps {
  proposal: IProposal;
  index: number;
  projectId: number;
  isLeading?: boolean;
  voteResultOfProposal?: IVoteResultOfProposal;
}

const ProposalListItem = ({
  proposal,
  projectId,
  index,
  isLeading = false,
  voteResultOfProposal,
}: ProposalListItemProps) => {
  const router = useRouter();

  const {
    totalValidPointsOfProposal,
    totalSupportedUserWeightOfProposal,
    totalValidQuorumOfProposal,
    formattedPercentageOfProposal,
    isUserVotedInProposal,
    isProposalValidated,
  } = voteResultOfProposal || {};

  const formattedDate = useMemo(() => {
    const date = new Date(proposal.createdAt);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [proposal.createdAt]);

  const formatAddress = useMemo(() => {
    return proposal.creator?.address
      ? `${proposal.creator.address.substring(0, 6)}...${proposal.creator.address.substring(
          proposal.creator.address.length - 6,
        )}`
      : '0x000...00000';
  }, [proposal.creator?.address]);

  const onViewProposal = useCallback(() => {
    router.push(`/project/pending/${projectId}/proposal/${proposal.id}`);
  }, [projectId, proposal.id, router]);

  return (
    <div className="mobile:p-[14px] flex flex-col gap-[10px] rounded-[10px] border border-black/10 bg-white p-[20px]">
      {/* leading */}
      <div className="flex items-center gap-[10px]">
        {isLeading && (
          <ActiveLeadingLabel
            isProposalValidated={isProposalValidated || false}
          />
        )}
        {isUserVotedInProposal && <VotedLabel />}
      </div>

      {/* title and date */}
      <div className="flex items-center gap-[10px] border-b border-black/10 pb-[10px]">
        <p className="font-mona text-[18px] font-[700] leading-[1.6] text-black">
          Proposal {index + 1}
        </p>
        <span className="text-[14px] font-[400] leading-[20px] text-black">
          {formattedDate}
        </span>
      </div>

      <div className="flex items-center gap-[10px]">
        <div className="flex items-center gap-[5px]">
          <span className="font-mona text-[18px] font-[500] leading-[25px] text-black">
            {formattedPercentageOfProposal}
          </span>
          {/* TODO: open progress info modal */}
          <InfoIcon size={20} className="opacity-30" />
        </div>
        <p className="flex gap-[10px] text-[14px] text-black">
          <span className="font-[600] text-black/60">
            Total Points Supported:
          </span>
          <span className="text-black/50">
            {totalSupportedUserWeightOfProposal}
          </span>
        </p>
      </div>

      {/* progress */}
      <ProgressLine
        percentage={formattedPercentageOfProposal}
        isProposalValidated={isProposalValidated}
      />

      {/* vote info */}
      <div className="flex flex-col gap-[10px] text-[14px] font-[600] leading-[19px] text-black">
        <div className="flex items-center gap-[10px]">
          <span>Min Points</span>
          <p>
            <span className="font-[600] text-black/80">
              {ESSENTIAL_ITEM_WEIGHT_SUM}
            </span>
            <span className="ml-[5px] text-black/50">
              ({totalValidPointsOfProposal} supported)
            </span>
          </p>
        </div>
        <div className="flex items-center gap-[10px]">
          <span>Min Participants:</span>
          <p>
            <span className="font-[600] text-black/80">
              {ESSENTIAL_ITEM_QUORUM_SUM}
            </span>
            <span className="ml-[5px] text-black/50">
              ({totalValidQuorumOfProposal} supported)
            </span>
          </p>
        </div>
      </div>

      {/* Creator */}
      <div className="flex items-center gap-[5px] text-[14px] leading-[20px] text-black">
        <span className="text-black/50">by: </span>
        <span className="">@{proposal.creator?.name || 'username'}</span>
        <span className="rounded-[4px] bg-[#F5F5F5] px-[4px] py-[2px] text-black/50">
          {formatAddress}
        </span>
      </div>

      <Button color="secondary" className="w-full" onPress={onViewProposal}>
        View Proposal
      </Button>
    </div>
  );
};

export default ProposalListItem;

export const ProposalListItemSkeleton = () => {
  return (
    <div className="mobile:p-[14px] flex flex-col gap-[10px] rounded-[10px] border border-black/10 bg-white p-[20px]">
      {/* leading labels area */}
      {/* <div className="flex items-center gap-[10px]">
        <Skeleton className="h-[24px] w-[80px] rounded-[12px]" />
        <Skeleton className="h-[24px] w-[60px] rounded-[12px]" />
      </div> */}

      {/* title and date */}
      <div className="flex items-center gap-[10px] border-b border-black/10 pb-[10px]">
        <Skeleton className="h-[25px] w-[120px]" />
        <Skeleton className="h-[20px] w-[120px]" />
      </div>

      {/* percentage and total points info */}
      <div className="flex items-center gap-[10px]">
        <div className="flex items-center gap-[5px]">
          <Skeleton className="h-[25px] w-[50px]" />
          <Skeleton className="size-[20px] rounded-full" />
        </div>
        <div className="flex gap-[10px]">
          <Skeleton className="h-[20px] w-[140px]" />
          <Skeleton className="h-[20px] w-[60px]" />
        </div>
      </div>

      {/* progress line */}
      <Skeleton className="h-[8px] w-full rounded-[4px]" />

      {/* vote info */}
      <div className="flex flex-col gap-[10px] text-[14px] font-[600] leading-[19px] text-black">
        <div className="flex items-center gap-[10px]">
          <Skeleton className="h-[19px] w-[80px]" />
          <div className="flex items-center gap-[5px]">
            <Skeleton className="h-[19px] w-[40px]" />
            <Skeleton className="h-[19px] w-[80px]" />
          </div>
        </div>
        <div className="flex items-center gap-[10px]">
          <Skeleton className="h-[19px] w-[120px]" />
          <div className="flex items-center gap-[5px]">
            <Skeleton className="h-[19px] w-[40px]" />
            <Skeleton className="h-[19px] w-[80px]" />
          </div>
        </div>
      </div>

      {/* Creator */}
      <div className="flex items-center gap-[5px] text-[14px] leading-[20px] text-black">
        <Skeleton className="h-[20px] w-[25px]" />
        <Skeleton className="h-[20px] w-[80px]" />
        <Skeleton className="h-[24px] w-[100px] rounded-[4px]" />
      </div>

      {/* View Proposal Button */}
      <Skeleton className="h-[40px] w-full rounded-[5px]" />
    </div>
  );
};
