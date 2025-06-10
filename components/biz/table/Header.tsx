'use client';

import { cn } from '@heroui/react';
import { ReactNode } from 'react';

export interface TableHeaderProps {
  children: ReactNode;
  width?: number | string;
  isFirst?: boolean;
  isLast?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Whether this table is inside a bordered container */
  isContainerBordered?: boolean;
}

export const TableHeader = ({
  children,
  width,
  isLast = false,
  className,
  style,
  isContainerBordered = false,
  ...props
}: TableHeaderProps) => {
  const headerStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    boxSizing: 'border-box' as const,
    ...style,
  };

  // Smart border logic based on container type
  const getBorderClasses = () => {
    if (isContainerBordered) {
      // For bordered containers: no left border, conditional right border
      return cn(
        'border-b-0 border-l-0',
        isLast ? 'border-r-0' : 'border-r border-black/10',
      );
    } else {
      // For non-bordered containers: default behavior
      return cn('border-l border-b border-black/10', isLast && 'border-r');
    }
  };

  return (
    <th
      style={headerStyle}
      className={cn(
        'h-[30px] px-[10px] text-left',
        'text-[14px] font-[600] text-black/60',
        getBorderClasses(),
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
