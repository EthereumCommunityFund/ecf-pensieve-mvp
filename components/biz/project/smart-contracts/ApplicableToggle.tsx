'use client';

import { Button, cn, Tooltip } from '@heroui/react';
import React from 'react';

export interface ApplicableToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export const ApplicableToggle: React.FC<ApplicableToggleProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const baseClassName =
    'h-[26px] rounded-[8px] px-[10px] text-[14px] font-semibold min-w-0';

  return (
    <Tooltip
      content={
        <div className="w-[176px] p-[10px]">
          <h3 className="mb-[5px] text-[13px] font-[700] text-black">
            Smart Contracts Toggle
          </h3>
          <p className="text-[13px] font-[400] text-black">
            Select N/A if this project doesn't have smart contracts
          </p>
        </div>
      }
      classNames={{
        base: ['bg-transparent'],
        content: [
          'p-0 bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px]',
        ],
      }}
      closeDelay={0}
      isDisabled={disabled}
    >
      <div
        className={cn(
          'inline-flex h-[32px] items-center gap-[5px] rounded-[10px] border border-[rgba(0,0,0,0.2)] bg-[#E1E1E1] p-[2px]',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <Button
          className={cn(
            baseClassName,
            value
              ? 'bg-[#464646] text-white'
              : 'bg-transparent text-black hover:bg-[rgba(70,70,70,0.1)] active:bg-[rgba(70,70,70,0.1)]',
          )}
          onPress={() => !disabled && onChange(true)}
          isDisabled={disabled}
        >
          Applicable
        </Button>
        <Button
          className={cn(
            baseClassName,
            !value
              ? 'bg-[#464646] text-white'
              : 'bg-transparent text-black hover:bg-[rgba(70,70,70,0.1)] active:bg-[rgba(70,70,70,0.1)]',
          )}
          onPress={() => !disabled && onChange(false)}
          isDisabled={disabled}
        >
          N/A
        </Button>
      </div>
    </Tooltip>
  );
};
