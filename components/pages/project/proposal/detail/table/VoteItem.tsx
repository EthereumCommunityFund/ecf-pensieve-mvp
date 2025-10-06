import { CircularProgress, cn, Tooltip } from '@heroui/react';
import { FC, memo } from 'react';

import { Button } from '@/components/base';
import { CheckedGreenIcon, UsersIcon, VoteIcon } from '@/components/icons';
import { QUORUM_AMOUNT } from '@/lib/constants';
import { IProject, IProposal } from '@/types';
import { IPocItemKey } from '@/types/item';
import { formatWeight } from '@/utils/weight';

import { useProposalDetailContext } from '../context/proposalDetailContext';
import { ITableProposalItem } from '../ProposalDetails';

interface IProps {
  fieldKey: IPocItemKey;
  project: IProject;
  proposal: IProposal;
  itemPoints: number;
  itemPointsNeeded: number;
  isReachQuorum: boolean;
  isReachPointsNeeded: boolean;
  isValidated: boolean;
  proposalItem: ITableProposalItem;
  votedMemberCount: number;
  isUserVoted: boolean;
  isProposalCreator: boolean;
  onAction: () => Promise<void>;
}

const VoteItem: FC<IProps> = ({
  fieldKey,
  itemPoints,
  votedMemberCount,
  isReachQuorum,
  isReachPointsNeeded,
  isValidated,
  itemPointsNeeded,
  onAction,
  isUserVoted,
  isProposalCreator,
}) => {
  // Get loading state from context
  const { isFetchVoteInfoLoading, isVoteActionPending, inActionKeys } =
    useProposalDetailContext();
  const isLoading =
    (isFetchVoteInfoLoading || isVoteActionPending) && !!inActionKeys[fieldKey];

  const maxValue = Math.max(itemPoints, itemPointsNeeded);

  return (
    <div className="flex flex-1 items-center justify-between gap-[10px]">
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
            {votedMemberCount}/{QUORUM_AMOUNT}
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
          isLoading={isLoading && !isValidated}
          disabled={isLoading || isUserVoted}
          onPress={onAction}
          className={cn(
            'px-[5px] border-none shrink-0 ml-[10px] bg-transparent hover:bg-transparent',
            isUserVoted ? 'cursor-not-allowed' : '',
          )}
        >
          {isValidated ? (
            <CheckedGreenIcon />
          ) : (
            <VoteIcon
              color={isUserVoted ? '#64C0A5' : 'black'}
              className={cn(
                isUserVoted ? 'opacity-100' : 'opacity-20 hover:opacity-50',
              )}
            />
          )}

          {/* {isUserVoted ? <CheckedGreenIcon /> : <CaretUpIcon />} */}
        </Button>
      </Tooltip>
    </div>
  );
};

export default memo(VoteItem);
