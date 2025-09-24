import { cn, Skeleton } from '@heroui/react';
import { FC, useCallback, useMemo } from 'react';

import { useProposalProgressModal } from '@/components/biz/modal/proposalProgress/Context';
import ShareButton from '@/components/biz/share/ShareButton';
import { InfoIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import useShareLink from '@/hooks/useShareLink';
import {
  ESSENTIAL_ITEM_QUORUM_SUM,
  ESSENTIAL_ITEM_WEIGHT_SUM,
} from '@/lib/constants';
import { trpc } from '@/lib/trpc/client';
import { IProposal } from '@/types';
import { devLog } from '@/utils/devLog';
import ProposalVoteUtils from '@/utils/proposal';

import ProgressLine from '../../ProgressLine';
import { ActiveLeadingLabel } from '../common/LeadingLabel';
import VotedLabel from '../common/VotedLabel';

import { VoteArrayType } from './useProposalVotes';

interface IProposalDetailCardProps {
  proposal?: IProposal;
  projectId: number;
  proposalIndex: number;
  leadingProposalId?: number;
}

const ProposalDetailCard: FC<IProposalDetailCardProps> = (props) => {
  const { profile } = useAuth();
  const { proposal, proposalIndex, leadingProposalId, projectId } = props;

  const proposalQueryOptions = useMemo(
    () => ({
      enabled: !!proposal && !!proposal.id,
      select: (data: VoteArrayType) => {
        devLog('getVotesByProposalId', data);
        return data;
      },
    }),
    [proposal],
  );

  const { data: votesOfProposal } = trpc.vote.getVotesByProposalId.useQuery(
    { proposalId: Number(proposal?.id) },
    proposalQueryOptions,
  );

  const {
    totalValidPointsOfProposal,
    totalSupportedPointsOfProposal,
    totalSupportedUserWeightOfProposal,
    formattedPercentageOfProposal,
    totalValidQuorumOfProposal,
    isUserVotedInProposal,
    isProposalValidated,
  } = useMemo(() => {
    return ProposalVoteUtils.getVoteResultOfProposal({
      proposalId: Number(proposal?.id),
      votesOfProposal: votesOfProposal || [],
      userId: profile?.userId,
    });
  }, [votesOfProposal, proposal, profile]);

  const { openProposalProgressModal } = useProposalProgressModal();

  const isLeading = !!leadingProposalId && leadingProposalId === proposal?.id;

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

  // Handle InfoIcon click event
  const handleInfoIconClick = useCallback(() => {
    openProposalProgressModal();
  }, [openProposalProgressModal]);

  const fallbackSharePath = useMemo(() => {
    if (!proposal) {
      return '';
    }
    return `/project/pending/${projectId}/proposal/${proposal.id}`;
  }, [projectId, proposal]);

  const {
    shareUrl,
    shareImageUrl,
    loading: shareLinkLoading,
    error: shareLinkError,
    ensure: ensureShareLink,
  } = useShareLink({
    entityType: 'proposal',
    entityId: proposal?.id,
    fallbackUrl: fallbackSharePath,
    enabled: !!proposal?.id,
  });

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
          {isLeading && (
            <ActiveLeadingLabel isProposalValidated={isProposalValidated} />
          )}
          {isUserVotedInProposal && <VotedLabel />}
        </div>
        {/* title and date */}
        <div className="flex items-center gap-[10px]">
          <p className="font-mona text-[18px] font-[700] leading-[1.6] text-black">
            Proposal {proposalIndex + 1}
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

      <div className="tablet:w-full mobile:w-full mobile:gap-[10px] flex flex-1 items-center justify-end gap-[20px]">
        {/* progress */}
        <div className="mobile:w-full tablet:w-full flex w-[516px]  flex-col gap-[10px] rounded-[10px] border border-black/10 px-[20px] py-[10px]">
          <div className="flex flex-col gap-[5px]">
            <div className="flex items-center justify-between">
              {/* Percentage */}
              <div className="flex items-center gap-[5px]">
                <span className="font-mona text-[18px] font-[600] leading-[25px] text-black">
                  {formattedPercentageOfProposal}
                </span>
                <button
                  onClick={handleInfoIconClick}
                  className="-m-1 cursor-pointer rounded-sm p-1 opacity-30 transition-opacity duration-200 hover:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  aria-label="View proposal progress information"
                  title="Click to learn more about proposal progress"
                >
                  <InfoIcon size={20} />
                </button>
              </div>
              {/* Total Supported */}
              <div className="flex items-center gap-[10px] text-[14px] font-[600] leading-[19px] text-black/50">
                <span>Total Points Supported:</span>
                <span>{totalSupportedPointsOfProposal}</span>
              </div>
            </div>

            <ProgressLine
              percentage={formattedPercentageOfProposal}
              isProposalValidated={isProposalValidated}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-[14px] font-[600] leading-[19px] text-black">
            <div className="flex items-center gap-[10px]">
              <span>Min Points</span>
              <div className="flex gap-[5px]">
                <span className="">{ESSENTIAL_ITEM_WEIGHT_SUM}</span>
                <span className="text-black/50">
                  ({totalValidPointsOfProposal} supported)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-[10px]">
              <span>Min Participation</span>
              <div className="flex gap-[5px]">
                <span className="">{ESSENTIAL_ITEM_QUORUM_SUM}</span>
                <span className="text-black/50">
                  ({totalValidQuorumOfProposal} voted)
                </span>
              </div>
            </div>
          </div>
        </div>

        <ShareButton
          shareUrl={shareUrl}
          shareImageUrl={shareImageUrl}
          className="size-[40px]"
          isLoading={shareLinkLoading}
          error={shareLinkError}
          onEnsure={ensureShareLink}
          onRefresh={ensureShareLink}
        />
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
        'p-[20px] tablet:p-[14px] mobile:p-[14px]',
        'mx-[20px] tablet:mx-[10px] mobile:mx-[10px]',
      )}
    >
      {/* basic info */}
      <div className="mobile:w-full flex flex-1 flex-col gap-[10px]">
        <div className="flex items-center gap-[10px]">
          {/* Leading and Voted labels skeleton - sometimes empty */}
          <Skeleton className="h-[30px] w-[160px] rounded-[4px]" />
          {/* <Skeleton className="h-[24px] w-[60px] rounded-[4px]" /> */}
        </div>
        {/* title and date */}
        <div className="flex items-center gap-[10px]">
          <Skeleton className="h-[29px] w-[120px]" />
          <Skeleton className="h-[20px] w-[120px]" />
        </div>
        {/* Creator */}
        <div className="flex items-center gap-[5px]">
          <Skeleton className="h-[20px] w-[25px]" />
          <Skeleton className="h-[20px] w-[80px]" />
          <Skeleton className="h-[24px] w-[100px] rounded-[4px]" />
        </div>
      </div>

      <div className="tablet:w-full mobile:w-full mobile:gap-[10px] flex flex-1 items-center justify-end gap-[20px]">
        {/* progress */}
        <div className="mobile:w-full tablet:w-full flex w-[516px] flex-col gap-[10px] rounded-[10px] border border-black/10 px-[20px] py-[10px]">
          <div className="flex flex-col gap-[5px]">
            <div className="flex items-center justify-between">
              {/* Percentage */}
              <div className="flex items-center gap-[5px]">
                <Skeleton className="h-[25px] w-[50px]" />
                <Skeleton className="size-[32px] rounded-sm" />
              </div>
              {/* Total Supported */}
              <div className="flex items-center gap-[10px]">
                <Skeleton className="h-[19px] w-[100px]" />
                <Skeleton className="h-[19px] w-[30px]" />
              </div>
            </div>

            {/* Progress Line */}
            <Skeleton className="h-[8px] w-full rounded-full" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[10px]">
              <Skeleton className="h-[19px] w-[90px]" />
              <Skeleton className="h-[19px] w-[40px]" />
            </div>

            <div className="flex items-center gap-[10px]">
              <Skeleton className="h-[19px] w-[100px]" />
              <Skeleton className="h-[19px] w-[30px]" />
            </div>
          </div>
        </div>

        <Skeleton className="mobile:size-[32px] size-[40px] rounded-md" />
      </div>
    </div>
  );
};
