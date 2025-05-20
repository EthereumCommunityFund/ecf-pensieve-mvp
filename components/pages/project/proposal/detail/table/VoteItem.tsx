import { CircularProgress, cn } from '@heroui/react';
import { FC } from 'react';

import { Button } from '@/components/base';
import { DefaultVoteQuorum, ItemWeightMap } from '@/constants/proposal';
import { IProject, IProposal, IVote } from '@/types';
import { CaretUpIcon, CheckedGreenIcon, UsersIcon } from '@/components/icons';

import { ITableProposalItem } from '../ProposalDetails';

interface IProps {
  fieldKey: string;
  project: IProject;
  proposal: IProposal;
  proposalItem: ITableProposalItem;
  votesOfKey: IVote[];
  votedMemberCount: number;
  isUserVoted: boolean;
  isLoading: boolean;
  onAction: () => Promise<void>;
}

const VoteItem: FC<IProps> = ({
  fieldKey,
  project,
  proposal,
  proposalItem,
  votedMemberCount,
  votesOfKey,
  onAction,
  isUserVoted,
  isLoading,
}) => {
  const currentPoints = votesOfKey.reduce(
    (acc, cur) => acc + Number(cur.weight),
    0,
  );
  const pointsNeeded = ItemWeightMap[fieldKey];
  const isReachQuorum = votedMemberCount >= DefaultVoteQuorum;
  const isReachPointsNeeded = currentPoints >= pointsNeeded;
  const isValidated = isReachQuorum && isReachPointsNeeded;

  const maxValue = Math.max(currentPoints, pointsNeeded);

  return (
    <div className="flex flex-1 items-center justify-between">
      <div className="flex items-center justify-start gap-[10px]">
        <CircularProgress
          aria-label="Loading..."
          color="warning"
          showValueLabel={true}
          size="sm"
          minValue={0}
          maxValue={maxValue}
          value={currentPoints}
          strokeWidth={3}
          formatOptions={{
            style: 'decimal',
          }}
          classNames={{
            base: '',
            label: '',
            value: 'text-[14px] font-[600] font-mona',
            svg: 'size-[36px] rotate-[180deg]',
            track: 'stroke-[#D9D9D9]',
            indicator: 'stroke-[#64C0A5]',
          }}
        />

        <div
          className={cn(
            'flex items-center justify-start gap-[5px]',
            isReachQuorum ? 'opacity-100' : 'opacity-20',
          )}
        >
          <UsersIcon />
          <span className="font-mona text-[14px] font-[600] leading-[19px] text-black">
            {votedMemberCount}/{DefaultVoteQuorum}
          </span>
        </div>
      </div>

      <Button
        color="secondary"
        size="sm"
        isIconOnly
        isLoading={isLoading}
        disabled={isLoading}
        onPress={onAction}
        className={cn('px-[5px] border-none', isUserVoted ? '' : 'opacity-30')}
      >
        {isUserVoted ? <CheckedGreenIcon /> : <CaretUpIcon />}
      </Button>
    </div>
  );
};

export default VoteItem;
