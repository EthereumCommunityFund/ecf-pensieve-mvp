import { Skeleton } from '@heroui/react';

const SharedListSkeleton = () => {
  return (
    <div className="flex justify-center px-[160px] py-8">
      <div className="flex w-[810px] flex-col gap-[10px]">
        {/* Back button skeleton */}
        <div className="flex items-center gap-[10px]">
          <div className="w-[440px]">
            <Skeleton className="h-[30px] w-[80px] rounded-[5px]" />
          </div>
        </div>

        {/* List info card skeleton */}
        <div className="flex flex-col gap-[10px] border-b border-[rgba(0,0,0,0.1)] pb-[20px]">
          <div className="flex flex-col gap-[10px]">
            {/* List name */}
            <div className="flex items-center gap-[10px]">
              <Skeleton className="h-[24px] w-[200px] rounded-[5px]" />
            </div>
            {/* List description */}
            <Skeleton className="h-[18px] w-[350px] rounded-[5px]" />
            <div className="flex items-center justify-between">
              <div className="flex gap-[10px]">
                {/* Created by skeleton */}
                <Skeleton className="h-[34px] w-[140px] rounded-[5px]" />
                {/* Privacy skeleton */}
                <Skeleton className="h-[34px] w-[100px] rounded-[5px]" />
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex items-center gap-[10px]">
          <Skeleton className="h-[40px] w-[160px] rounded-[5px]" />
        </div>

        {/* Projects list skeleton */}
        <div className="flex flex-col gap-[10px]">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[120px] w-full rounded-[10px]" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SharedListSkeleton;
