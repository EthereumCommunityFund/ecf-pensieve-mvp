'use client';

import { cn, Skeleton } from '@heroui/react';
import { FC } from 'react';

import { Button } from '@/components/base/button';

export interface TabSkeletonProps {
  /** Number of tab placeholders to show */
  tabCount?: number;
  /** Custom className for the container */
  className?: string;
}

const TabSkeleton: FC<TabSkeletonProps> = ({ tabCount = 2, className }) => {
  return (
    <div
      className={cn(
        'flex rounded-[10px] bg-[#F0F0F0] border border-[rgba(0,0,0,0.1)] p-[5px] gap-[10px]',
        className,
      )}
    >
      {Array.from({ length: tabCount }).map((_, index) => (
        <Button
          key={`tab-skeleton-${index}`}
          className={cn(
            'flex-1 px-5 py-2.5 border-none',
            // Use inactive tab style for skeleton
            index === 0
              ? 'bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px] hover:bg-white opacity-100'
              : 'bg-transparent rounded-[5px] opacity-80 hover:bg-transparent cursor-default',
          )}
          isDisabled
        >
          <div className="flex items-center gap-2.5">
            {/* Tab label skeleton - varying widths for different tab names */}
            <Skeleton
              className={cn(
                'h-[19px] rounded', // "Consensus Log" - medium
                'w-20', // fallback for additional tabs
              )}
            />
          </div>
        </Button>
      ))}
    </div>
  );
};
export default TabSkeleton;
