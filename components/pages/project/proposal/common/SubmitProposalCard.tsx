import { cn } from '@heroui/react';
import { FC, useMemo } from 'react';

import { Button } from '@/components/base';
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
    return formatDate(latestVotingEndedAt, 'MMM, DD, YYYY');
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
            <p className="text-[15px] font-[400] leading-[20px] text-black/80">
              View existing proposal(s) and vote on or submit a new one for
              review if none are accurate.
            </p>
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
