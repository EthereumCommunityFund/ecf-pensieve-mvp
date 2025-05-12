'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Skeleton } from '@heroui/react';

import { Button } from '@/components/base';
import { IProposal } from '@/types';

interface ProposalListItemProps {
  proposal: IProposal;
  projectId: number;
  isLeading?: boolean;
  hasVoted?: boolean;
}

const ProposalListItem = ({
  proposal,
  projectId,
  isLeading = false,
  hasVoted = true,
}: ProposalListItemProps) => {
  const proposalName = useMemo(() => {
    const nameItem = proposal.items.find(
      (item: any) => item.key === 'projectName',
    ) as { key: string; value: string } | undefined;
    return nameItem?.value || 'Unnamed Proposal';
  }, [proposal.items]);

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
        {isLeading && (
          <div className="flex items-center gap-[5px] rounded-[5px] border border-[rgba(104,204,174,0.40)] bg-[rgba(104,204,174,0.10)] px-[8px] py-[4px] text-[14px] font-[400] leading-[20px] text-[#40A486]">
            <span>Leading Proposal</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M8.4375 8.4375C8.58668 8.4375 8.72976 8.49676 8.83525 8.60225C8.94074 8.70774 9 8.85082 9 9V11.8125C9 11.9617 9.05926 12.1048 9.16475 12.2102C9.27024 12.3157 9.41332 12.375 9.5625 12.375"
                stroke="#40A486"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.71875 6.60938C9.10708 6.60938 9.42188 6.29458 9.42188 5.90625C9.42188 5.51792 9.10708 5.20312 8.71875 5.20312C8.33042 5.20312 8.01562 5.51792 8.01562 5.90625C8.01562 6.29458 8.33042 6.60938 8.71875 6.60938Z"
                fill="#40A486"
              />
              <path
                d="M9 15.75C12.7279 15.75 15.75 12.7279 15.75 9C15.75 5.27208 12.7279 2.25 9 2.25C5.27208 2.25 2.25 5.27208 2.25 9C2.25 12.7279 5.27208 15.75 9 15.75Z"
                stroke="#40A486"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
        {hasVoted && (
          <div className="flex items-center gap-[5px] text-[14px] font-[700] leading-[20px] text-[#40A486]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <g clipPath="url(#clip0_860_7270)">
                <path
                  d="M6.875 10.625L8.75 12.5L13.125 8.125"
                  stroke="#40A486"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z"
                  stroke="#40A486"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_860_7270">
                  <rect width="20" height="20" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <span>You voted in this proposal</span>
          </div>
        )}
      </div>

      {/* title and date */}
      <div className="flex items-center gap-[10px] border-b border-black/10 pb-[10px]">
        <p className="font-mona text-[18px] font-[700] leading-[1.6px] text-black">
          {proposalName}
        </p>
        <span className="text-[14px] font-[400] leading-[20px] text-black">
          {formattedDate}
        </span>
      </div>

      {/* progress */}
      <div className="flex items-center gap-[10px]">
        <span className="font-mona text-[18px] font-[500] leading-[25px] text-black">
          {progressPercentage}%
        </span>
        <div className="flex h-[10px] flex-1 items-center justify-start bg-[#D7D7D7] px-px">
          <div
            className="h-[7px] bg-black"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* vote info */}
      <div className="flex flex-col gap-[10px] text-[14px] font-[600] leading-[19px] text-black">
        <div className="flex items-center justify-between">
          <span>Points Needed</span>
          <span className="text-black/60">00/00</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Supported</span>
          <span className="text-black/60">82</span>
        </div>
        <div className="flex items-center justify-between">
          <span>quorum</span>
          <span className="text-black/60">00/00</span>
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

      <Link href={`/project/${projectId}/proposal/${proposal.id}`}>
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
