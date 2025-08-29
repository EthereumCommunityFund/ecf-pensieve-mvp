'use client';

import { Skeleton } from '@heroui/react';
import React from 'react';

const SearchProjectItemSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between gap-[14px] border-b border-black/5 p-[10px] last:border-b-0">
      <div className="flex min-w-0 flex-1 items-center gap-[14px]">
        {/* Project Icon Skeleton */}
        <Skeleton className="size-[40px] shrink-0 rounded-[5px]" />

        {/* Project Info Skeleton */}
        <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
          {/* Project Name and Transparency Skeleton */}
          <div className="flex items-center gap-[6px]">
            <Skeleton className="h-[18px] w-[120px] rounded-[4px]" />
            <div className="flex shrink-0 items-center gap-[6px]">
              <Skeleton className="size-[18px] rounded-full" />
              <Skeleton className="h-[16px] w-[100px] rounded-[4px]" />
            </div>
          </div>
          {/* Tagline Skeleton */}
          <Skeleton className="h-[16px] w-full rounded-[4px]" />
          <Skeleton className="h-[16px] w-4/5 rounded-[4px]" />
        </div>
      </div>

      <div className="flex flex-col gap-[10px]">
        <Skeleton className="h-[24px] w-[55px] rounded-[4px]" />
        <Skeleton className="h-[24px] w-[55px] rounded-[4px]" />
      </div>
    </div>
  );
};

export default SearchProjectItemSkeleton;
