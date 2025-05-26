'use client';

import { Skeleton } from '@heroui/react';
import { ReactNode } from 'react';
import { cn } from '@heroui/react';

export interface TableCellSkeletonProps {
  width?: number | string;
  isLast?: boolean;
  isLastRow?: boolean;
  className?: string;
  style?: React.CSSProperties;
  minHeight?: number;
  skeletonHeight?: number;
  skeletonWidth?: string;
  skeletonClassName?: string;
  children?: ReactNode; // Optional custom skeleton content
}

export const TableCellSkeleton = ({
  width,
  isLast = false,
  isLastRow = false,
  className,
  style,
  minHeight = 60,
  skeletonHeight = 20,
  skeletonWidth = 'w-full',
  skeletonClassName,
  children,
  ...props
}: TableCellSkeletonProps) => {
  const cellStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    boxSizing: 'border-box' as const,
    ...style,
  };

  return (
    <td
      style={cellStyle}
      className={cn(
        'border-b border-r border-black/10',
        isLast && 'border-r-0',
        isLastRow && 'border-b-0',
        className,
      )}
      {...props}
    >
      <div
        className="flex w-full items-center overflow-hidden whitespace-normal break-words px-[10px]"
        style={{ minHeight: `${minHeight}px` }}
      >
        {children || (
          <Skeleton
            className={cn(
              `h-[${skeletonHeight}px] ${skeletonWidth} rounded`,
              skeletonClassName,
            )}
          />
        )}
      </div>
    </td>
  );
};
