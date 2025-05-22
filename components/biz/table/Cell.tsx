'use client';

import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface TableCellProps {
  children: ReactNode;
  width?: number | string;
  isLast?: boolean;
  isLastRow?: boolean;
  className?: string;
  style?: React.CSSProperties;
  minHeight?: number;
}

export const TableCell = ({
  children,
  width,
  isLast = false,
  isLastRow = false,
  className,
  style,
  minHeight = 60,
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
      className={cn(
        'border-l border-b border-black/10 bg-[#FFF] hover:bg-[#EBEBEB]',
        isLast && 'border-r',
        // isLastRow && 'border-b-0',
        className,
      )}
      {...props}
    >
      <div
        className="line-height-[19px] flex w-full items-center overflow-hidden whitespace-normal break-words p-[10px] text-[16px]"
        style={{ minHeight: `${minHeight}px` }}
      >
        {children}
      </div>
    </td>
  );
};
