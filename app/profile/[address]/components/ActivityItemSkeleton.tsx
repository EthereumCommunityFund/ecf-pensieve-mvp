import { Skeleton } from '@heroui/react';

interface ActivityItemSkeletonProps {
  isLast: boolean;
  variant?: 'initial' | 'loadMore';
}

export default function ActivityItemSkeleton({
  isLast,
  variant = 'initial',
}: ActivityItemSkeletonProps) {
  const isLoadMore = variant === 'loadMore';

  return (
    <div className="mobile:items-start relative flex w-full items-center">
      <div className="relative flex size-8 shrink-0 items-center justify-center">
        <Skeleton className="size-[26px] rounded-full" />
      </div>
      {!isLast && (
        <div
          className={`absolute bottom-[-30px] left-4 top-8 w-px -translate-x-1/2 border-l border-black/10`}
        />
      )}
      <div className="mobile:flex-col mobile:gap-[10px] ml-2.5 flex w-full items-center justify-between">
        <div className="mobile:w-full flex w-[400px] flex-col gap-2.5">
          <Skeleton className="h-[20px] w-full rounded" />
        </div>
        <Skeleton className="mobile:w-full h-8 w-28 rounded-[5px]" />
      </div>
    </div>
  );
}
