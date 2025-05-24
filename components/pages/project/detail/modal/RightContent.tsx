'use client';

import { cn } from '@heroui/react';
import { FC } from 'react';

import { Button } from '@/components/base/button';
import { InfoIcon } from '@/components/icons';

interface RightContentProps {
  userWeight?: number;
  currentItemWeight?: number;
  onSubmitEntry?: () => void;
}

const RightContent: FC<RightContentProps> = ({
  userWeight = 0,
  currentItemWeight = 0,
  onSubmitEntry,
}) => {
  return (
    <div className="flex flex-col gap-2.5 p-5">
      {/* Your Weight Section */}
      <div className="flex flex-col gap-3.5 rounded-[10px] border border-[rgba(0,0,0,0.1)] bg-white p-3.5">
        {/* Header with title and info icon */}
        <div className="flex justify-between gap-2.5 border-b border-dashed border-[rgba(0,0,0,0.1)] pb-2.5">
          <div className="flex items-center gap-[5px]">
            <span className="font-mona text-[18px] font-semibold leading-[1.41] tracking-[1.39%] text-black">
              Your Weight
            </span>
            <div className="opacity-50">
              <InfoIcon size={20} />
            </div>
          </div>
          <span className="font-mona text-[18px] font-semibold leading-[1.41] tracking-[1.39%] text-black">
            {userWeight.toString().padStart(2, '0')}
          </span>
        </div>

        {/* Weight Information */}
        <div className="flex flex-col gap-[5px]">
          <span className="font-mona text-[13px] font-semibold leading-[1.41] text-black opacity-80">
            Current Item Weight: {currentItemWeight.toString().padStart(2, '0')}
          </span>
          <span className="font-sans text-[13px] leading-[1.54] text-black opacity-80">
            Your weight exceeds the item's threshold, allowing you to surpass
            the weight of any submission you vote on.
          </span>
        </div>
      </div>

      {/* Contribute Section */}
      <div className="flex flex-col gap-3.5 rounded-[10px]  p-2.5">
        {/* Content */}
        <div className="flex flex-col gap-[5px]">
          <span className="font-mona text-[14px] font-semibold leading-[1.41] tracking-[1.79%] text-black">
            Contribute
          </span>
          <span className="font-sans text-[14px] leading-[1.43] text-black opacity-80">
            You can vote or participate in submissions.
          </span>
        </div>

        {/* Submit Entry Button */}
        <Button
          className={cn(
            'flex items-center justify-center gap-2.5 rounded-[5px] border border-[rgba(0,0,0,0.1)]',
            'bg-transparent px-[30px] py-2.5',
            'hover:bg-[rgba(0,0,0,0.1)] transition-colors duration-200',
            'h-auto min-w-0',
          )}
          onPress={onSubmitEntry}
        >
          <span className="font-sans text-[14px] font-semibold leading-[1.36] text-black">
            Submit an Entry
          </span>
        </Button>
      </div>
    </div>
  );
};

export default RightContent;
