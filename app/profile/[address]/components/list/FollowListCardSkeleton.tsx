import { cn, Skeleton } from '@heroui/react';

interface FollowListCardSkeletonProps {
  showBorderBottom?: boolean;
}

const FollowListCardSkeleton = ({
  showBorderBottom,
}: FollowListCardSkeletonProps) => {
  return (
    <div
      className={cn(
        'relative flex w-full pb-[10px]',
        showBorderBottom ? 'border-b border-black/10' : '',
      )}
    >
      <div className="flex flex-1 flex-col gap-[10px] rounded-[10px] p-[10px]">
        <div className="flex items-start justify-between">
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

        {/* Creator info skeleton */}
        <div className="flex w-fit items-center gap-[5px] p-[5px]">
          <Skeleton className="h-[19px] w-[20px] rounded-[3px]" />
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-[19px] w-[80px] rounded-[3px]" />
        </div>
      </div>
    </div>
  );
};

export default FollowListCardSkeleton;
