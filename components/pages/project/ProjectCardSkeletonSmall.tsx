'use client';

import { Skeleton } from '@heroui/react';

interface IProjectCardSkeletonSmallProps {
  showBorder?: boolean;
  showCreator?: boolean;
  showUpvote?: boolean;
}

export function ProjectCardSkeletonSmall({
  showBorder = false,
  showCreator = true,
  showUpvote = true,
}: IProjectCardSkeletonSmallProps) {
  return (
    <div className="py-0">
      <div className="rounded-[5px] p-0 px-[10px] py-[7px]">
        <div className="mobile:items-start flex items-center justify-start gap-[14px]">
          <div className="-m-2.5 flex flex-1 items-start gap-[14px] rounded-[10px] p-2.5">
            <Skeleton className="mobile:hidden box-content size-[40px] overflow-hidden rounded-[5px]" />
            <Skeleton className="mobile:block hidden size-[40px] overflow-hidden rounded-[5px]" />

            <div className="mobile:max-w-full flex-1">
              <Skeleton className="h-[20px] w-[100px] rounded-[4px]" />
              <Skeleton className="mt-[4px] h-[18px] w-full rounded-[4px]" />

              {showCreator && (
                <Skeleton className="mt-[6px] h-[18px] w-[180px] rounded-[4px]" />
              )}
            </div>
          </div>

          {showUpvote && (
            <div className="flex flex-col items-center justify-center gap-[3px] text-center">
              <Skeleton className="size-[30px] rounded-[4px]" />
              <Skeleton className="h-[12px] w-[30px] rounded-[4px]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectCardSkeletonSmall;
