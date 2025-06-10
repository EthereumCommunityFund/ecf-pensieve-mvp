import { CircularProgress, cn, Tooltip } from '@heroui/react';
import { FC, memo } from 'react';

import { Button } from '@/components/base';
import { CaretUpIcon, CheckedGreenIcon, UsersIcon } from '@/components/icons';
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
  // 从context获取loading状态
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
              size="sm"
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
                svg: 'size-[18px] rotate-[180deg]',
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
            <div className={'opacity-30'}>
              <UsersIcon />
            </div>
          </Tooltip>
          <span className="font-mona text-[13px] font-[600] leading-[19px] text-black/50">
            {votedMemberCount}/{QUORUM_AMOUNT}
          </span>
        </div>
      </div>

      <Tooltip
        content="Vote on Input"
        classNames={{
          content: 'p-[10px] rounded-[5px] border border-black/10',
        }}
        closeDelay={0}
      >
        <Button
          color="secondary"
          size="sm"
          isIconOnly
          isLoading={isLoading}
          disabled={isLoading || isUserVoted}
          onPress={onAction}
          className={cn(
            'px-[5px] border-none shrink-0 ml-[10px]',
            isUserVoted ? '' : 'opacity-30',
            isUserVoted ? 'cursor-not-allowed' : '',
          )}
        >
          {isUserVoted ? <CheckedGreenIcon /> : <CaretUpIcon />}
        </Button>
      </Tooltip>
    </div>
  );
};

export default memo(VoteItem);
