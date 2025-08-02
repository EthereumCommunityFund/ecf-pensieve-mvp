import { Skeleton } from '@heroui/react';

interface ListDetailSkeletonProps {
  withSidebar?: boolean;
}

const ListDetailSkeleton = ({
  withSidebar = false,
}: ListDetailSkeletonProps) => {
  const content = (
    <div className="flex flex-1 flex-col gap-[10px]">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[10px]">
          <Skeleton className="h-[30px] w-[100px] rounded-[5px]" />
        </div>
        <Skeleton className="h-[30px] w-[120px] rounded-[5px]" />
      </div>

      {/* List info skeleton */}
      <div className="flex flex-col gap-[10px] border-b border-[rgba(0,0,0,0.1)] pb-[20px]">
        <div className="flex items-center gap-[10px]">
          <Skeleton className="h-[24px] w-[200px] rounded-[5px]" />
          <Skeleton className="size-[28px] rounded-[5px]" />
        </div>
        <Skeleton className="h-[18px] w-[300px] rounded-[5px]" />
        <div className="flex items-center gap-[5px]">
          <Skeleton className="size-5 rounded-[3px]" />
          <Skeleton className="h-[14px] w-[60px] rounded-[3px]" />
        </div>
      </div>

      {/* Edit mode controls skeleton */}
      <div className="flex items-center justify-end">
        <Skeleton className="h-[30px] w-[140px] rounded-[5px]" />
      </div>

      {/* Projects list skeleton */}
      <div className="flex flex-col gap-[10px]">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[120px] w-full rounded-[10px]" />
        ))}
      </div>
    </div>
  );

  if (withSidebar) {
    return (
      <div className="mobile:px-[10px] px-[40px]">
        <div className="mx-auto flex w-full max-w-[1200px] gap-5 pb-16 pt-8">
          <div className="w-[280px]" />
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default ListDetailSkeleton;
