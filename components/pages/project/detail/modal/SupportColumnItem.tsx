import { CircularProgress, cn, Tooltip } from '@heroui/react';
import { FC, memo, useCallback, useMemo } from 'react'; // Added useMemo

import { Button } from '@/components/base';
import { CheckedGreenIcon, UsersIcon, VoteIcon } from '@/components/icons';
import { useProjectDetailContext } from '@/components/pages/project/context/projectDetailContext'; // Added import
import { useAuth } from '@/context/AuthContext';
import { QUORUM_AMOUNT } from '@/lib/constants';
import { IItemProposalVoteRecord, IProposalsByProjectIdAndKey } from '@/types';
import { IPocItemKey } from '@/types/item';
import { formatWeight } from '@/utils/weight';

import { IKeyItemDataForTable } from '../table/ProjectDetailTableColumns';

interface IProps {
  itemKey: IPocItemKey;
  itemPoints: number;
  itemPointsNeeded: number;
  showQuorum?: boolean;
  isReachQuorum: boolean;
  votedMemberCount: number;
  isUserVoted: boolean;
  isLoading?: boolean; // Made optional
  isProposalCreator: boolean;
  onCreateItemProposalVote: (
    key: IPocItemKey,
    itemProposalId: number,
  ) => Promise<void>;
  onCancelVote: (
    key: IPocItemKey,
    voteRecordId: number,
    itemProposalId: number,
  ) => Promise<void>;
  onSwitchItemProposalVote: (
    key: IPocItemKey,
    itemProposalId: number,
  ) => Promise<void>;
  proposalId: number;
  displayProposalDataListOfProject: IKeyItemDataForTable[];
  proposalsByProjectIdAndKey: IProposalsByProjectIdAndKey;
  userVotedItemProposal?: IItemProposalVoteRecord;
  isUserVotedInProposalOrItemProposals: boolean;
  isUserVotedCurrentItemProposal: boolean;
}

const SupportColumnItem: FC<IProps> = ({
  itemKey,
  itemPoints,
  itemPointsNeeded,
  showQuorum = false,
  isReachQuorum,
  votedMemberCount,
  isLoading,
  isProposalCreator,
  onCreateItemProposalVote,
  onSwitchItemProposalVote,
  proposalId,
  isUserVotedInProposalOrItemProposals,
  isUserVotedCurrentItemProposal,
  // isLoading prop is kept from props for now, but internalIsLoading will be primary
}) => {
  const { inActionItemProposalIdMap } = useProjectDetailContext();
  const { isAuthenticated, showAuthPrompt } = useAuth();

  const internalIsLoading = useMemo(() => {
    return !!(
      inActionItemProposalIdMap && inActionItemProposalIdMap[proposalId]
    );
  }, [inActionItemProposalIdMap, proposalId]);

  const maxValue = Math.max(itemPoints, itemPointsNeeded);

  const isValidated = isReachQuorum && itemPoints >= itemPointsNeeded;

  const handleAction = useCallback(() => {
    if (!isAuthenticated) {
      showAuthPrompt();
      return;
    }

    if (isUserVotedCurrentItemProposal) {
      // Cannot cancel vote for item proposal
      console.warn('can not cancel item proposal vote');
    } else {
      if (isUserVotedInProposalOrItemProposals) {
        // Voted for this key in proposal, or in item proposals
        onSwitchItemProposalVote(itemKey, proposalId);
      } else {
        // Not voted for this key in proposal, nor in item proposals
        onCreateItemProposalVote(itemKey, proposalId);
      }
    }
  }, [
    itemKey,
    proposalId,
    onCreateItemProposalVote,
    isUserVotedInProposalOrItemProposals,
    isUserVotedCurrentItemProposal,
    onSwitchItemProposalVote,
    isAuthenticated,
    showAuthPrompt,
  ]);

  return (
    <div className="flex flex-1 items-center justify-between">
      <div className="flex items-center justify-start gap-[10px]">
        <Tooltip
          content="Supported CP"
          classNames={{
            content: 'p-[10px] rounded-[5px] border border-black/10',
          }}
          closeDelay={0}
        >
          <div className="flex items-center gap-[5px]">
            <CircularProgress
              aria-label="Loading..."
              color="warning"
              showValueLabel={false}
              size="md"
              minValue={0}
              maxValue={maxValue}
              value={itemPoints}
              strokeWidth={8}
              formatOptions={{
                style: 'decimal',
              }}
              classNames={{
                base: '',
                label: '',
                svg: 'size-[20px] rotate-[180deg]',
                track: 'stroke-[#D9D9D9]',
                indicator: 'stroke-[#64C0A5]',
              }}
            />
            <span
              className={cn(
                'font-mona text-[13px] font-[600] leading-[19px] min-w-[30px]',
                itemPoints >= itemPointsNeeded
                  ? 'text-[#64C0A5]'
                  : 'text-black/50',
              )}
            >
              {formatWeight(itemPoints)}
            </span>
          </div>
        </Tooltip>
        <div className={cn('flex items-center justify-start gap-[5px]')}>
          <Tooltip
            content="Minimum Participation Required"
            classNames={{
              content: 'p-[10px] rounded-[5px] border border-black/10',
            }}
            closeDelay={0}
          >
            <UsersIcon
              color={isValidated ? '#64C0A5' : 'black'}
              className={`opacity-${isValidated ? '80' : '30'}`}
            />
          </Tooltip>
          <span
            className={cn(
              'font-mona text-[13px] font-[600] leading-[19px] ',
              isValidated ? 'text-[#64C0A5]' : 'text-black/50',
            )}
          >
            {votedMemberCount}
            {showQuorum && `/${QUORUM_AMOUNT}`}
          </span>
        </div>
      </div>

      <Tooltip
        content={isValidated ? 'Item Validated' : 'Vote on Input'}
        classNames={{
          content: 'p-[10px] rounded-[5px] border border-black/10',
        }}
        closeDelay={0}
      >
        <Button
          color="secondary"
          size="sm"
          isIconOnly
          isLoading={internalIsLoading && !isValidated} // Use internalIsLoading
          disabled={internalIsLoading || isUserVotedCurrentItemProposal} // Use internalIsLoading
          onPress={handleAction}
          className={cn(
            'px-[5px] border-none bg-transparent hover:bg-transparent',
            // isUserVotedCurrentItemProposal ? '' : 'opacity-30',
            isUserVotedCurrentItemProposal ? 'cursor-not-allowed' : '', // Use internalIsLoading
          )}
        >
          {isValidated ? (
            <CheckedGreenIcon />
          ) : (
            <VoteIcon
              color={isUserVotedCurrentItemProposal ? '#64C0A5' : 'black'}
              className={cn(
                isUserVotedCurrentItemProposal
                  ? 'opacity-100'
                  : 'opacity-20 hover:opacity-50',
              )}
            />
          )}
          {/* {isUserVotedCurrentItemProposal ? (
            <CheckedGreenIcon />
          ) : (
            <CaretUpIcon />
          )} */}
        </Button>
      </Tooltip>
    </div>
  );
};

export default memo(SupportColumnItem);
