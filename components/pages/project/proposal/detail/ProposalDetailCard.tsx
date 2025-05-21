import { cn, Skeleton } from '@heroui/react';
import { FC, useMemo } from 'react';

import {
  TotalEssentialItemQuorumSum,
  TotalEssentialItemWeightSum,
} from '@/constants/proposal';
import { IProposal } from '@/types';

import { ActiveLeadingLabel } from '../common/LeadingLabel';
import VotedLabel from '../common/VotedLabel';

import { useProposalVotes } from './useProposalVotes';

interface IProposalDetailCardProps {
  proposal?: IProposal;
  projectId: number;
  isLeading?: boolean;
  hasVoted?: boolean;
  proposalIndex: number;
}

const ProposalDetailCard: FC<IProposalDetailCardProps> = (props) => {
  const { proposal, projectId, isLeading, hasVoted, proposalIndex } = props;

  const { voteResultOfProposal } = useProposalVotes(proposal, projectId);

  const {
    percentageOfProposal,
    totalValidPointsOfProposal,
    totalSupportedUserWeightOfProposal,
    formattedPercentageOfProposal,
    totalValidQuorumOfProposal,
  } = voteResultOfProposal;

  const formattedDate = useMemo(() => {
    if (!proposal) return '';
    const date = new Date(proposal?.createdAt);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [proposal]);

  const formatAddress = useMemo(() => {
    if (!proposal) return '';
    return proposal.creator?.address
      ? `${proposal.creator.address.substring(0, 6)}...${proposal.creator.address.substring(
          proposal.creator.address.length - 6,
        )}`
      : '0x000...00000';
  }, [proposal]);

  const progressPercentage = 48;

  if (!proposal) {
    return <ProposalDetailCardSkeleton />;
  }

  return (
    <div
      className={cn(
        'flex justify-between items-center gap-[20px]',
        'mobile:flex-col gap-[10px]',
        'mt-[10px]',
        'bg-white border border-black/10 rounded-[10px]',
        'p-[20px] tablet:p-[14px] mobile:p-[14px]',
        'mx-[20px] tablet:mx-[10px] mobile:mx-[10px]',
      )}
    >
      {/* basic info */}
      <div className="mobile:w-full flex flex-1 flex-col gap-[10px]">
        <div className="flex items-center gap-[10px]">
          {isLeading && <ActiveLeadingLabel />}
          {hasVoted && <VotedLabel />}
        </div>
        {/* title and date */}
        <div className="flex items-center gap-[10px]">
          <p className="font-mona text-[18px] font-[700] leading-[1.6] text-black">
            Proposal {proposalIndex}
          </p>
          <span className="shrink-0 text-[14px] font-[400] leading-[20px] text-black">
            {formattedDate}
          </span>
        </div>
        {/* Creator */}
        <div className="flex items-center gap-[5px] text-[14px] leading-[20px] text-black">
          <span className="text-black/50">by: </span>
          <span className="">@{proposal?.creator?.name || 'username'}</span>
          <span className="rounded-[4px] bg-[#F5F5F5] px-[4px] py-[2px] text-black/50">
            {formatAddress}
          </span>
        </div>
      </div>

      {/* progress */}
      <div className="mobile:w-full flex w-[440px] flex-col gap-[20px] rounded-[10px] border border-black/10 p-[10px]">
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

        <div className="flex items-center justify-between text-[14px] font-[600] leading-[19px] text-black">
          <div className="flex items-center gap-[10px]">
            <span>Points Needed</span>
            <span className="text-black/60">
              {totalValidPointsOfProposal}/{TotalEssentialItemWeightSum}
            </span>
          </div>
          <div className="flex items-center gap-[10px]">
            <span>Supported</span>
            <span className="text-black/60">
              {totalSupportedUserWeightOfProposal}
            </span>
          </div>
          <div className="flex items-center gap-[10px]">
            <span>quorum</span>
            <span className="text-black/60">
              {totalValidQuorumOfProposal}/{TotalEssentialItemQuorumSum}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetailCard;

const ProposalDetailCardSkeleton = () => {
  return (
    <div
      className={cn(
        'flex justify-between items-center gap-[20px]',
        'mobile:flex-col gap-[10px]',
        'mt-[10px]',
        'bg-white border border-black/10 rounded-[10px]',
        'p-[20px] mobile:p-[14px]',
        'mx-[20px] mobile:mx-[10px]',
      )}
    >
      {/* basic info */}
      <div className="mobile:w-full flex flex-1 flex-col gap-[10px]">
        <div className="flex items-center gap-[10px]">
          <Skeleton className="h-[20px] w-[120px]" />
          <Skeleton className="h-[20px] w-[180px]" />
          {/* {hasVoted && <VotedLabel />} */}
        </div>
        {/* title and date */}
        <div className="flex items-center gap-[10px]">
          <Skeleton className="h-[20px] w-[200px]" />
          <Skeleton className="h-[20px] w-[80px]" />
        </div>
        {/* Creator */}
        <div className="flex items-center gap-[5px] text-[14px] leading-[20px] text-black">
          <Skeleton className="size-[20px]" />
          <Skeleton className="h-[20px] w-[60px]" />
          <Skeleton className="h-[20px] w-[100px]" />
        </div>
      </div>

      {/* progress & vote info */}
      <div className="mobile:w-full flex w-[440px] flex-col gap-[20px] rounded-[10px] border border-black/10 p-[10px]">
        <div className="flex items-center gap-[10px]">
          <Skeleton className="h-[25px] w-[40px]" />
          <Skeleton className="h-[10px] flex-1" />
        </div>

        <div className="flex items-center justify-between text-[14px] font-[600] leading-[19px] text-black">
          <div className="flex items-center gap-[10px]">
            <Skeleton className="h-[19px] w-[60px]" />
            <Skeleton className="h-[19px] w-[40px]" />
          </div>
          <div className="flex items-center gap-[10px]">
            <Skeleton className="h-[19px] w-[60px]" />
            <Skeleton className="h-[19px] w-[40px]" />
          </div>
          <div className="flex items-center gap-[10px]">
            <Skeleton className="h-[19px] w-[60px]" />
            <Skeleton className="h-[19px] w-[40px]" />
          </div>
        </div>
      </div>
    </div>
  );
};
