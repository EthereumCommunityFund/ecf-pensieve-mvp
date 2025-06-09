'use client';

import { cn } from '@heroui/react';
import { ReactNode } from 'react';

export interface TableCellProps {
  children: ReactNode;
  width?: number | string;
  isLast?: boolean;
  isLastRow?: boolean;
  className?: string;
  style?: React.CSSProperties;
  minHeight?: number;
  colspan?: number;
  /** Whether this table is inside a bordered container */
  isContainerBordered?: boolean;
}

export const TableCell = ({
  children,
  width,
  isLast = false,
  isLastRow = false,
  className,
  style,
  minHeight = 60,
  colspan,
  isContainerBordered = false,
  ...props
}: TableCellProps) => {
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
      );
    } else {
      // For non-bordered containers: default behavior
      return cn(
        'border-l border-b border-black/10',
        isLast && 'border-r',
        // isLastRow && 'border-b-0',
      );
    }
  };

  return (
    <td
      style={cellStyle}
      colSpan={colspan}
      className={cn('hover:bg-[#EBEBEB]', getBorderClasses(), className)}
      {...props}
    >
      <div
        className="flex w-full items-center overflow-hidden whitespace-normal break-words p-[10px] text-[16px] leading-[19px]"
        style={{ minHeight: `${minHeight}px` }}
      >
        {children}
      </div>
    </td>
  );
};
