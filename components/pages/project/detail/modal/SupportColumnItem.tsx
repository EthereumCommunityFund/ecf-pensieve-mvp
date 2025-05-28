import { CircularProgress, cn } from '@heroui/react';
import { FC, memo } from 'react';

import { Button } from '@/components/base';
import { CaretUpIcon, CheckedGreenIcon, UsersIcon } from '@/components/icons';
import { QUORUM_AMOUNT } from '@/lib/constants';
import { IPocItemKey } from '@/types/item';

interface IProps {
  itemKey: IPocItemKey;
  itemPoints: number;
  itemPointsNeeded: number;
  isReachQuorum: boolean;
  votedMemberCount: number;
  isUserVoted: boolean;
  isLoading: boolean;
  isProposalCreator: boolean;
  onAction: () => Promise<void>;
}

const SupportColumnItem: FC<IProps> = ({
  itemKey,
  itemPoints,
  itemPointsNeeded,
  isReachQuorum,
  votedMemberCount,
  isUserVoted,
  isLoading,
  isProposalCreator,
  onAction,
}) => {
  const maxValue = Math.max(itemPoints, itemPointsNeeded);

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
          value={itemPoints}
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
            isReachQuorum ? 'opacity-50' : 'opacity-30',
          )}
        >
          <UsersIcon />
          <span className="font-mona text-[14px] font-[600] leading-[19px] text-black">
            {votedMemberCount}/{QUORUM_AMOUNT}
          </span>
        </div>
      </div>

      <Button
        color="secondary"
        size="sm"
        isIconOnly
        isLoading={isLoading}
        disabled={isLoading || isProposalCreator}
        onPress={onAction}
        className={cn(
          'px-[5px] border-none',
          isUserVoted ? '' : 'opacity-30',
          isProposalCreator ? 'cursor-not-allowed' : '',
        )}
      >
        {isUserVoted ? <CheckedGreenIcon /> : <CaretUpIcon />}
      </Button>
    </div>
  );
};

export default memo(SupportColumnItem);
