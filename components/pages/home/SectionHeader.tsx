import React from 'react';

import { Button } from '@/components/base';

export interface ISectionProps {
  title: string;
  description: string;
  buttonText?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  updateAt?: string;
  icon?: React.ReactNode;
}

const SectionHeader = (props: ISectionProps) => {
  return (
    <div className="px-[10px]">
      <div className="mobile:flex-col mobile:items-start flex flex-1 items-center justify-between gap-[10px] py-[4px]">
        <div>
          <div className="flex items-center gap-[10px]">
            {props.icon}
            <p className="tablet:text-[18px] mobile:text-[18px] text-[24px] font-[700] leading-[1.4] text-black/80">
              {props.title}
            </p>
          </div>

          {props.description && (
            <p className="mt-[5px] text-[14px] font-[400] leading-[19px] text-black/60">
              {props.description}
            </p>
          )}
        </div>
        {props.buttonText && (
          <div className="">
            <Button size="sm" onPress={props.onClick} className="font-[400]">
              {props.buttonText}
            </Button>
          </div>
        )}
      </div>
      {props.updateAt && (
        <p className="mt-[10px] text-left text-[10px] font-[400] leading-[14px] text-black/60">
          {props.updateAt}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
