import { Button, cn, Tooltip } from '@heroui/react';
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
    <Tooltip
      content={
        <div className="w-[176px] p-[10px]">
          <h3 className="mb-[5px] text-[13px] font-[700] text-black">
            Not Applicable
          </h3>
          <p className="text-[13px] font-[400] text-black">
            Select if the item is not applicable for this project
          </p>
        </div>
      }
      classNames={{
        base: ['bg-transparent'],
        content: [
          'p-0 bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px]',
        ],
      }}
    >
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
    </Tooltip>
  );
};

export default ApplicableSwitch;
