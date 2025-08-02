import { cn, Skeleton } from '@heroui/react';

interface CommonListCardSkeletonProps {
  showBorderBottom?: boolean;
}

const CommonListCardSkeleton = ({
  showBorderBottom,
}: CommonListCardSkeletonProps) => {
  return (
    <div
      className={cn(
        'relative flex w-full pb-[10px]',
        showBorderBottom ? 'border-b border-black/10' : '',
      )}
    >
      <div className="flex flex-1 items-center justify-between rounded-[10px] p-[10px]">
        <div className="flex-1">
          {/* Title skeleton */}
          <Skeleton className="h-[15px] w-[160px] rounded-[5px]" />

          {/* Description skeleton */}
          <Skeleton className="mt-[6px] h-[18px] w-[240px] rounded-[5px]" />

          {/* Privacy info skeleton */}
          <div className="mt-[10px] flex items-center gap-[5px]">
            <Skeleton className="size-5 rounded-[3px]" />
            <Skeleton className="h-[14px] w-[50px] rounded-[3px]" />
          </div>
        </div>

        {/* Dropdown button skeleton */}
        <Skeleton className="size-[40px] rounded-[5px]" />
      </div>
    </div>
  );
};

export default CommonListCardSkeleton;
