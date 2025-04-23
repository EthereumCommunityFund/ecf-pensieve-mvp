import { Tooltip } from '@heroui/react';
import React from 'react';

import ECFButton from '@/components/base/button';
import { InfoIcon, PlusIcon } from '@/components/icons';

import ApplicableSwitch from './ApplicableSwitch';

export interface FormFieldContainerProps {
  label: string;
  description?: string;
  shortDescription?: string;
  weight?: string;
  children: React.ReactNode;

  showApplicable?: boolean;
  isApplicable?: boolean;
  onChangeApplicability?: (isApplicable: boolean) => void;

  showReference?: boolean;
  onAddReference?: () => void;
}

export const FormFieldContainer: React.FC<FormFieldContainerProps> = ({
  label,
  description,
  shortDescription,
  weight,
  children,
  showApplicable,
  isApplicable = true,
  onChangeApplicability = () => {},
  showReference = true,
  onAddReference,
}) => {
  return (
    <div className="flex w-full flex-col gap-[10px]">
      <div className="flex w-full items-center gap-[5px]">
        <span className="text-[16px] font-semibold leading-[1.6] text-black">
          {label}
        </span>
        <Tooltip
          classNames={{
            base: ['bg-transparent'],
            content: [
              'p-[10px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px] text-black',
            ],
          }}
          content={
            <div className="flex-col gap-[5px]">
              {/* TODO Mona Sans font */}
              <div className="text-[14px] font-[500]">{label}</div>
              <div className="text-[13px] font-[400] opacity-80">
                {shortDescription || description}
              </div>
            </div>
          }
        >
          <div className="opacity-50">
            <InfoIcon size={20} />
          </div>
        </Tooltip>
        {weight && (
          <div className="flex items-center gap-[5px] rounded-[4px] border border-[rgba(0,0,0,0.1)] bg-[rgba(0,0,0,0.05)] px-[4px] py-[2px]">
            <span className="text-[14px] font-[600] text-black opacity-50">
              Weight:
            </span>
            <span className="text-[14px] font-[600] text-black opacity-50">
              {weight}
            </span>
          </div>
        )}
      </div>
      {description && (
        <span className="text-sm text-black opacity-80">{description}</span>
      )}
      {showApplicable && (
        <div className="flex justify-start">
          <ApplicableSwitch
            isApplicable={isApplicable}
            onChange={onChangeApplicability}
          />
        </div>
      )}
      {children}
      {showReference && (
        <div className="flex h-[28px] items-center justify-end px-[8px] opacity-60">
          <ECFButton
            className="h-[28px] gap-[5px] border-none bg-transparent px-[8px] text-[14px] font-[600] text-black hover:bg-black/10 active:bg-black/10"
            onPress={onAddReference}
            startContent={<PlusIcon size={16} />}
          >
            Add Reference
          </ECFButton>
        </div>
      )}
    </div>
  );
};
