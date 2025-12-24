import { cn, Skeleton } from '@heroui/react';

type ThreadCommentSkeletonProps = {
  depth?: number;
  hasDivider?: boolean;
};

export function ThreadCommentSkeleton({
  depth = 0,
  hasDivider = false,
}: ThreadCommentSkeletonProps) {
  return (
    <div
      className={cn(
        'flex gap-3',
        hasDivider ? 'pt-[10px] border-t border-black/10' : '',
      )}
      style={{ marginLeft: depth ? depth * 44 : 0 }}
    >
      <Skeleton className="size-[30px] rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-[14px] w-[120px] rounded-[4px]" />
          <Skeleton className="h-[12px] w-[80px] rounded-[4px]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-[14px] w-full rounded-[4px]" />
          <Skeleton className="h-[14px] w-5/6 rounded-[4px]" />
        </div>
        <Skeleton className="h-[24px] w-[80px] rounded-[6px]" />
      </div>
    </div>
  );
}
