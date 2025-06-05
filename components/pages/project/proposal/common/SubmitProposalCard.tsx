import { cn } from '@heroui/react';
import { FC } from 'react';

import { Button } from '@/components/base';

interface IProps {
  onSubmitProposal: () => void;
  showFullOnTablet?: boolean;
}

const SubmitProposalCard: FC<IProps> = ({
  onSubmitProposal,
  showFullOnTablet = false,
}) => {
  return (
    <div
      className={cn(
        'mobile:w-full flex w-[300px] flex-col gap-[10px] rounded-[10px] border border-black/10 bg-white p-[14px]',
        showFullOnTablet ? 'tablet:w-full' : '',
      )}
    >
      <div className="flex flex-col gap-[10px]">
        <p className="text-[18px] font-[600] leading-[25px] text-black">
          Vote or Propose
        </p>
        <p className="text-[15px] font-[400] leading-[20px] text-black/80">
          View existing proposal(s) and vote on or submit a new one for review
          if none are accurate.
        </p>
      </div>
      <Button onPress={onSubmitProposal}>Submit a Proposal</Button>
      <div className="text-center text-[12px] font-[400] leading-[16px] text-black/45">
        {' '}
        Community Validation v0.0.1
      </div>
    </div>
  );
};

export default SubmitProposalCard;
