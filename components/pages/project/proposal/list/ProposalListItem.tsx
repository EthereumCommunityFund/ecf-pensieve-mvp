'use client';

import { Skeleton } from '@heroui/react';
import Link from 'next/link';
import { useMemo } from 'react';

import { Button } from '@/components/base';
import { IProposal } from '@/types';
import { IVoteResultOfProposal } from '@/utils/proposal';

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
  const {
    totalValidPointsOfProposal,
    totalSupportedUserWeightOfProposal,
    totalValidQuorumOfProposal,
    formattedPercentageOfProposal,
    TotalEssentialItemWeightSum,
    TotalEssentialItemQuorumSum,
    isUserVotedInProposal,
  } = voteResultOfProposal || {};

  const formattedDate = useMemo(() => {
    const date = new Date(proposal.createdAt);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [proposal.createdAt]);

  const progressPercentage = 48;

  const formatAddress = useMemo(() => {
    return proposal.creator?.address
      ? `${proposal.creator.address.substring(0, 6)}...${proposal.creator.address.substring(
          proposal.creator.address.length - 6,
        )}`
      : '0x000...00000';
  }, [proposal.creator?.address]);

  return (
    <div className="mobile:p-[14px] flex flex-col gap-[10px] rounded-[10px] border border-black/10 bg-white p-[20px]">
      {/* leading */}
      <div className="flex items-center gap-[10px]">
        {isLeading && <ActiveLeadingLabel />}
        {isUserVotedInProposal && <VotedLabel />}
      </div>

      {/* title and date */}
      <div className="flex items-center gap-[10px] border-b border-black/10 pb-[10px]">
        <p className="font-mona text-[18px] font-[700] leading-[1.6] text-black">
          Proposal {proposal.id}
        </p>
        <span className="text-[14px] font-[400] leading-[20px] text-black">
          {formattedDate}
        </span>
      </div>

      {/* progress */}
      <div className="flex items-center gap-[10px]">
        <span className="font-mona text-[18px] font-[500] leading-[25px] text-black">
          {formattedPercentageOfProposal}
        </span>
        <div className="flex h-[10px] flex-1 items-center justify-start bg-[#D7D7D7] px-px">
          <div
            className="h-[7px] bg-black"
            style={{ width: formattedPercentageOfProposal }}
          ></div>
        </div>
      </div>

      {/* vote info */}
      <div className="flex flex-col gap-[10px] text-[14px] font-[600] leading-[19px] text-black">
        <div className="flex items-center justify-between">
          <span>Points Needed</span>
          <span className="text-black/60">
            {totalValidPointsOfProposal}/{TotalEssentialItemWeightSum}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Supported</span>
          <span className="text-black/60">
            {totalSupportedUserWeightOfProposal}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>quorum</span>
          <span className="text-black/60">
            {totalValidQuorumOfProposal}/{TotalEssentialItemQuorumSum}
          </span>
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

      <Link href={`/project/pending/${projectId}/proposal/${proposal.id}`}>
        <Button color="secondary" className="w-full">
          View Proposal
        </Button>
      </Link>
    </div>
  );
};

export default ProposalListItem;

export const ProposalListItemSkeleton = () => {
  return (
    <div className="mobile:p-[14px] flex flex-col gap-[10px] rounded-[10px] border border-black/10 bg-white p-[20px]">
      {/* title and date */}
      <div className="flex items-center gap-[10px] border-b border-black/10 pb-[10px]">
        <Skeleton className="h-[20px] w-[100px]" />
        <Skeleton className="h-[20px] w-[100px]" />
      </div>

      {/* progress */}
      <div className="flex items-center gap-[10px]">
        <Skeleton className="h-[25px] w-[40px]" />
        {/* <span className="text-[18px] font-[500] leading-[25px] text-black font-mona">
          {progressPercentage}%
        </span> */}
        <Skeleton className="h-[10px] flex-1" />
      </div>

      {/* vote info */}
      <div className="flex flex-col gap-[10px] text-[14px] font-[600] leading-[19px] text-black">
        <div className="flex items-center justify-between">
          <Skeleton className="h-[19px] w-[100px]" />
          <Skeleton className="h-[19px] w-[60px]" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-[19px] w-[90px]" />
          <Skeleton className="h-[19px] w-[60px]" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-[19px] w-[80px]" />
          <Skeleton className="h-[19px] w-[60px]" />
        </div>
      </div>

      {/* Creator */}
      <div className="flex items-center gap-[5px] text-[14px] leading-[20px] text-black">
        <Skeleton className="size-[20px]" />
        <Skeleton className="h-[20px] w-[60px]" />
        <Skeleton className="h-[20px] w-[100px]" />
      </div>

      <div>
        <Skeleton className="h-[40px] w-full rounded-[5px]" />
      </div>
    </div>
  );
};
