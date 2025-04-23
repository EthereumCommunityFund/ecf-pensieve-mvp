import { Button, cn } from '@heroui/react';
import React from 'react';

export interface ApplicableSwitchProps {
  isApplicable: boolean;
  onChange: (isApplicable: boolean) => void;
}

const ApplicableSwitch: React.FC<ApplicableSwitchProps> = ({
  isApplicable,
  onChange,
}) => {
  const baseClassName =
    'h-[26px] rounded-[8px] px-[10px] text-[14px] font-semibold min-w-0';

  return (
    // TODO not applicable tooltip
    <div className="inline-flex h-[32px] items-center gap-[5px] rounded-[10px] border border-[rgba(0,0,0,0.2)] bg-[#E1E1E1] p-[2px]">
      <Button
        className={cn(
          baseClassName,
          isApplicable
            ? 'bg-[#464646] text-white'
            : 'bg-transparent text-black hover:bg-[rgba(70,70,70,0.1)] active:bg-[rgba(70,70,70,0.1)]',
        )}
        onPress={() => onChange(true)}
      >
        Applicable
      </Button>
      <Button
        className={cn(
          baseClassName,
          !isApplicable
            ? 'bg-[#464646] text-white'
            : 'bg-transparent text-black hover:bg-[rgba(70,70,70,0.1)] active:bg-[rgba(70,70,70,0.1)]',
        )}
        onPress={() => onChange(false)}
      >
        N/A
      </Button>
    </div>
  );
};

export default ApplicableSwitch;
