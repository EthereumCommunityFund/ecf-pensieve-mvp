'use client';

import { FC } from 'react';

const SaveToListSkeleton: FC = () => {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-[10px] rounded-[12px] px-2 py-1"
        >
          <div className="flex items-center gap-[10px]">
            <div className="flex size-[28px] items-center justify-center">
              <div className="size-[19.25px] animate-pulse rounded-[4px] bg-gray-200" />
            </div>
            <div className="h-[19px] w-[120px] animate-pulse rounded-[4px] bg-gray-200" />
          </div>
          <div className="flex size-[24px] items-center justify-center">
            <div className="size-6 animate-pulse rounded-[4px] bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SaveToListSkeleton;
