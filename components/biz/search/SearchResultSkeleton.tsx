'use client';

import { Skeleton } from '@heroui/react';

export default function SearchResultSkeleton() {
  return (
    <div className="cursor-pointer px-4 py-3">
      <div className="flex items-start gap-3">
        {/* Project Icon Skeleton */}
        <Skeleton className="size-10 shrink-0 rounded-md" />

        <div className="min-w-0 flex-1 space-y-2">
          {/* Project Name Skeleton */}
          <Skeleton className="h-4 w-3/4 rounded" />

          {/* Project Description Skeleton */}
          <div className="space-y-1">
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-2/3 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
