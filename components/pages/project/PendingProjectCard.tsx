'use client';

import { cn, Skeleton } from '@heroui/react';
import Link from 'next/link';
import { useMemo } from 'react';

import { useAuth } from '@/context/AuthContext';
import {
  ESSENTIAL_ITEM_QUORUM_SUM,
  ESSENTIAL_ITEM_WEIGHT_SUM,
} from '@/lib/constants';
import { IProfile, IProject } from '@/types';
import ProposalVoteUtils from '@/utils/proposal';

export function PendingProjectCardSkeleton() {
  return (
    <div className="py-[10px]">
      <div className="flex items-center justify-start gap-[20px] rounded-[10px] p-[10px]">
        <div className="flex flex-1 items-start gap-[14px]">
          {/* <Skeleton className="mobile:size-[60px] size-[100px] rounded-[10px]" /> */}
          <div className="mobile:max-w-full max-w-[440px] flex-1">
            <Skeleton className="h-[18px] w-[200px] rounded-[4px]" />
            <Skeleton className="mt-[6px] h-[18px] w-full rounded-[4px]" />
            <Skeleton className="mt-[6px] h-[18px] w-[120px] rounded-[4px]" />
            <div className="mt-[10px] flex flex-wrap gap-[8px]">
              <Skeleton className="h-[22px] w-[60px] rounded-[6px]" />
              <Skeleton className="h-[22px] w-[60px] rounded-[6px]" />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-[4px] text-center">
          <Skeleton className="mx-auto size-[40px] rounded-lg" />
          <Skeleton className="h-[13px] w-[30px] rounded-[4px]" />
          <Skeleton className="h-[11px] w-[20px] rounded-[4px]" />
        </div>
      </div>
    </div>
  );
}

interface IProjectCardProps {
  project: IProject;
  showBorder?: boolean;
}

const PendingProjectCard = ({
  project,
  showBorder = false,
}: IProjectCardProps) => {
  const { profile } = useAuth();
  const userId = profile?.userId;

  const { leadingProposalId, leadingProposalResult, voteResultOfProposalMap } =
    useMemo(() => {
      return ProposalVoteUtils.getVoteResultOfProject({
        projectId: project.id,
        votesOfProject: project.proposals.flatMap(
          (proposal) => proposal.voteRecords || [],
        ),
        proposals: project.proposals,
        userId,
      });
    }, [project, userId]);

  const {
    formattedPercentageOfProposal,
    totalValidPointsOfProposal,
    totalSupportedUserWeightOfProposal,
    totalValidQuorumOfProposal,
  } = leadingProposalResult;

  const leadingProposal = useMemo(() => {
    if (!leadingProposalId) return null;
    return (project.proposals || []).find(
      (proposal) => proposal.id === leadingProposalId,
    );
  }, [project, leadingProposalId]);

  const leadingProposalCreator = useMemo(() => {
    if (!leadingProposal) return null;
    const creator = leadingProposal.creator;
    return typeof creator === 'string' ? creator : (creator as IProfile).name;
  }, [leadingProposal]);

  return (
    <div
      className={cn(
        showBorder && 'border-b border-[rgba(0, 0, 0, 0.1)]',
        'pb-[10px] pt-[10px]',
      )}
    >
      <Link
        href={`/project/pending/${project.id}`}
        className={cn(
          'flex cursor-pointer items-center justify-start gap-5 rounded-[10px] p-[10px] transition-colors duration-200 hover:bg-[rgba(0,0,0,0.05)]',
          'mobile:flex-col mobile:items-start',
        )}
      >
        <div className="flex flex-1 flex-col gap-[10px]">
          <div>
            <p className="text-[18px] font-[600] leading-[20px] text-black">
              {project.name}
            </p>
            <p className="mt-[4px] text-[14px] font-[400] leading-[18px] text-black">
              {project.mainDescription}
            </p>
          </div>

          <div className="flex flex-wrap gap-[8px]">
            {project.categories.map((tag) => (
              <div
                key={tag}
                className="flex h-[22px] items-center justify-center rounded-[6px] bg-[rgba(0,0,0,0.05)] px-[12px]"
              >
                <span className="text-[12px] font-[600] leading-[12px] text-black">
                  {tag}
                </span>
              </div>
            ))}
          </div>

          <div className="text-[14px] font-[600] leading-[18px] text-black">
            <p>
              Total Proposals:{' '}
              <span className="text-black/60">
                {project.proposals.length || 0}
              </span>
            </p>
            {project.proposals && project.proposals.length > 0 && (
              <p className="mt-[5px]">
                Leading:{' '}
                <span className="text-black/60">@{leadingProposalCreator}</span>
              </p>
            )}
          </div>
        </div>

        <div
          className={cn(
            'flex w-[235px] flex-col gap-[10px] rounded-[10px] border border-black/10 bg-[#EFEFEF] p-[10px] text-[14px] leading-[19px] text-black',
            'mobile:w-full',
          )}
        >
          <div className="flex items-center justify-between">
            <span className="font-mona text-[16px] font-[500]">
              {formattedPercentageOfProposal}
            </span>
            <span className="text-black/60">
              {totalValidPointsOfProposal}/{ESSENTIAL_ITEM_WEIGHT_SUM}
            </span>
          </div>

          <div className="flex h-[10px] flex-1 items-center justify-start bg-[#D7D7D7] px-px">
            <div
              className="h-[7px] bg-black"
              style={{ width: formattedPercentageOfProposal }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-[600]">Supported</span>
            <span className="text-black/60">
              {totalSupportedUserWeightOfProposal}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-[600]">Quorum</span>
            <span className="text-black/60">
              {totalValidQuorumOfProposal}/{ESSENTIAL_ITEM_QUORUM_SUM}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PendingProjectCard;
