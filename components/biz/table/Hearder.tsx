'use client';

import { cn } from '@heroui/react';
import { ReactNode } from 'react';

export interface TableHeaderProps {
  children: ReactNode;
  width?: number | string;
  isLast?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const TableHeader = ({
  children,
  width,
  isLast = false,
  className,
  style,
  ...props
}: TableHeaderProps) => {
  const headerStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    boxSizing: 'border-box' as const,
    ...style,
  };

  return (
    <th
      style={headerStyle}
      className={cn(
        'h-[30px] border-l border-b border-black/10 px-[10px] text-left',
        'text-[14px] font-[600] text-black/60',
        isLast && 'border-r-0',
        className,
      )}
      {...props}
    >
      <div
        className="flex items-center"
        style={{ width: '100%', overflow: 'hidden' }}
      >
        {children}
      </div>
    </th>
  );
};
