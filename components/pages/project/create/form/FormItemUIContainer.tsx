import { cn, Tooltip } from '@heroui/react';
import React from 'react';

import { Button } from '@/components/base';
import ApplicableSwitch from '@/components/biz/FormAndTable/ApplicableSwitch';
import { InfoIcon, PaperClipIcon, PlusIcon } from '@/components/icons';

export interface IFormItemUIContainerProps {
  label: string;
  description?: string;
  shortDescription?: string;
  weight?: string | number;
  children: React.ReactNode;

  showApplicable?: boolean;
  isApplicable?: boolean;
  onChangeApplicability?: (isApplicable: boolean) => void;

  showReference?: boolean;
  onAddReference?: () => void;
  hasValue?: boolean;
  hasReference?: boolean;
}

export const FormItemUIContainer: React.FC<IFormItemUIContainerProps> = ({
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
  hasValue = false,
  hasReference = false,
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
              <div className="font-mona text-[14px] font-[500]">{label}</div>
              <div className="text-[13px] font-[400] opacity-80">
                {shortDescription || description}
              </div>
            </div>
          }
          closeDelay={0}
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
        <span className="text-[13px] text-black opacity-80">{description}</span>
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
        <div className="flex h-[28px] items-center justify-start opacity-60">
          <Button
            color="secondary"
            className={cn(
              'h-[28px] gap-[5px] border-none px-[8px]',
              hasReference
                ? 'bg-[rgba(0,0,0,0.05)] opacity-100'
                : 'opacity-60 hover:bg-black/10 hover:opacity-100',
              !hasValue &&
                !hasReference &&
                'cursor-not-allowed opacity-40 hover:opacity-40',
            )}
            onPress={onAddReference}
            isDisabled={!hasValue && !hasReference}
            startContent={
              hasReference ? (
                <PaperClipIcon size={18} />
              ) : (
                <PlusIcon size={16} />
              )
            }
          >
            {hasReference ? 'Edit Reference' : 'Add Reference'}
          </Button>
        </div>
      )}
    </div>
  );
};
