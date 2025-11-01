'use client';

import React from 'react';

export const NotificationItemSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-[30px] border-b border-black/10 bg-[rgba(104,198,172,0.05)] p-[14px]">
      <div className="flex w-full items-start gap-2.5">
        {/* Icon Skeleton */}
        <div className="size-8 shrink-0 animate-pulse rounded-full bg-gray-200" />

        {/* Content Skeleton */}
        <div className="flex flex-1 flex-col gap-2.5">
          {/* Text Content Skeleton */}
          <div className="flex flex-col gap-2.5">
            {/* Main text skeleton */}
            <div className="flex w-full items-start justify-between gap-5">
              <div className="flex flex-wrap items-center gap-1">
                <div className="h-[20px] w-[200px] animate-pulse rounded bg-gray-200" />
                <div className="h-[22px] w-[60px] animate-pulse rounded-[10px] bg-gray-100" />
                <div className="size-[20px] animate-pulse rounded bg-gray-200" />
                <div className="h-[22px] w-[80px] animate-pulse rounded-[10px] bg-gray-100" />
              </div>
            </div>

            {/* Time skeleton */}
            <div className="h-[12px] w-[40px] animate-pulse rounded bg-gray-200" />

            {/* Action Button skeleton */}
            <div className="flex gap-2.5">
              <div className="h-[32px] w-[100px] animate-pulse rounded-[5px] bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotificationListSkeleton: React.FC<{ count?: number }> = ({
  count = 3,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <NotificationItemSkeleton key={index} />
      ))}
    </>
  );
};
