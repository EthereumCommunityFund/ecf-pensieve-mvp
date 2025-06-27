'use client';

import { cn, Skeleton } from '@heroui/react';
import { ReactNode } from 'react';

export interface TableCellSkeletonProps {
  width?: number | string;
  isFirst?: boolean;
  isLast?: boolean;
  isLastRow?: boolean;
  className?: string;
  style?: React.CSSProperties;
  minHeight?: number;
  skeletonHeight?: number;
  skeletonWidth?: string;
  skeletonClassName?: string;
  children?: ReactNode; // Optional custom skeleton content
  /** Whether this table is inside a bordered container */
  isContainerBordered?: boolean;
}

export const TableCellSkeleton = ({
  width,
  isFirst = false,
  isLast = false,
  isLastRow = false,
  className,
  style,
  minHeight = 60,
  skeletonHeight = 20,
  skeletonWidth = 'w-full',
  skeletonClassName,
  children,
  isContainerBordered = false,
  ...props
}: TableCellSkeletonProps) => {
  const cellStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    boxSizing: 'border-box' as const,
    ...style,
  };

  // Smart border logic based on container type
  const getBorderClasses = () => {
    if (isContainerBordered) {
      // For bordered containers: no left border, conditional right border, keep bottom border for row separation
      return cn(
        'border-l-0',
        isLast ? 'border-r-0' : 'border-r border-black/10',
        isLastRow ? 'border-b-0' : 'border-b border-black/10',
        // Add rounded corners for last row to align with container
        isLastRow && isFirst && 'rounded-bl-[10px]',
        isLastRow && isLast && 'rounded-br-[10px]',
      );
    } else {
      // For non-bordered containers: default behavior
      return cn(
        'border-l border-b border-black/10',
        isLast && 'border-r',
        isLastRow && 'border-b-0',
      );
    }
  };

  return (
    <td
      style={cellStyle}
      className={cn(getBorderClasses(), className)}
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
