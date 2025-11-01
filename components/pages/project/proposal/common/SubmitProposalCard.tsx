import { CircularProgress, cn } from '@heroui/react';
import { FC, useMemo } from 'react';

import { Button } from '@/components/base';
import { TapHandIcon, UsersIcon, VoteIcon } from '@/components/icons';
import { formatDate } from '@/utils/formatters';

interface IProps {
  onSubmitProposal: () => void;
  showFullOnTablet?: boolean;
  canBePublished?: boolean;
  latestVotingEndedAt?: Date | null;
}

const SubmitProposalCard: FC<IProps> = ({
  onSubmitProposal,
  showFullOnTablet = false,
  canBePublished,
  latestVotingEndedAt,
}) => {
  const formattedLatestVotingEndedAt = useMemo(() => {
    return formatDate(latestVotingEndedAt, 'YYYY-MM-DD');
  }, [latestVotingEndedAt]);

  return (
    <div
      className={cn(
        'mobile:w-full flex w-[300px] flex-col rounded-[10px] border border-black/10 bg-white p-[14px]',
        showFullOnTablet ? 'tablet:w-full' : '',
        canBePublished ? 'gap-[20px]' : 'gap-[10px]',
      )}
    >
      <p className="text-[18px] font-[600] leading-[25px] text-black">
        Vote or Propose
      </p>
      {canBePublished ? (
        <div className="flex flex-col gap-[20px]">
          <div className="flex flex-col gap-[10px] text-[15px] font-[600] leading-[20px] text-black/80">
            <p>Voting Ended</p>
            <p>({formattedLatestVotingEndedAt})</p>
          </div>
          <Button
            disabled={true}
            className="h-auto cursor-not-allowed whitespace-pre-wrap p-[10px] text-left text-[15px] font-[400] leading-[20px] text-black/80"
          >
            The project is currently being published. This process may take up
            to 15 minutes.
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-[10px]">
            <p className="text-[14px] font-[400] leading-[20px] text-black/50">
              Vote on existing proposals or submit a new one for review if none
              are accurate.
            </p>
            <p className="mt-[14px] text-[12px] leading-[20px] text-black/50">
              Click this icon to vote on items:
            </p>
          </div>
          <div className="relative mt-[5px] flex items-center justify-between rounded-[5px] bg-[#F8F8F8] p-[10px]">
            <div className="flex items-center">
              <CircularProgress
                aria-label="Loading..."
                color="warning"
                showValueLabel={false}
                size="md"
                minValue={0}
                maxValue={120}
                value={120}
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
                  'ml-[5px] font-mona text-[13px] font-[600] leading-[19px] text-[#64C0A5]',
                )}
              >
                120
              </span>
              <UsersIcon color={'black'} className={'ml-[10px] opacity-30'} />
              <span
                className={cn(
                  'ml-[5px] font-mona text-[13px] font-[600] leading-[19px] ',
                  'text-black/50',
                )}
              >
                2/3
              </span>
            </div>

            <VoteIcon color={'black'} className={cn('opacity-20')} />

            <div className="absolute bottom-[3px] right-[3px]">
              <TapHandIcon />
            </div>
          </div>
          <Button onPress={onSubmitProposal}>Submit a Proposal</Button>
        </>
      )}
      <div className="text-center text-[12px] font-[400] leading-[16px] text-black/45">
        {' '}
        Community Validation v0.0.1
      </div>
    </div>
  );
};

export default SubmitProposalCard;
