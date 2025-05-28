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
  ...props
}: TableCellProps) => {
  const cellStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    boxSizing: 'border-box' as const,
    ...style,
  };

  return (
    <td
      style={cellStyle}
      colSpan={colspan}
      className={cn(
        'border-l border-b border-black/10 hover:bg-[#EBEBEB]',
        isLast && 'border-r',
        // isLastRow && 'border-b-0',
        className,
      )}
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
