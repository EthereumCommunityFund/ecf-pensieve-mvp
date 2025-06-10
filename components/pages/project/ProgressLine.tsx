import { cn } from '@heroui/react';

interface ProgressLineProps {
  /**
   * formatted percentage of the progress line
   */
  percentage?: string;
  isProposalValidated?: boolean;
}

const ProgressLine = ({
  percentage,
  isProposalValidated,
}: ProgressLineProps) => {
  return (
    <div className="flex h-[10px] flex-1 items-center justify-start rounded-[10px] bg-[#D7D7D7] p-[2px]">
      <div
        className={cn(
          'h-[6px] rounded-[10px]',
          isProposalValidated ? 'bg-[#64C0A5]' : 'bg-black',
        )}
        style={{ width: percentage || '0%' }}
      />
    </div>
  );
};

export default ProgressLine;
