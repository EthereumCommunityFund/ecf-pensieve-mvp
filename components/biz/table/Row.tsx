'use client';

import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface TableRowProps {
  children: ReactNode;
  isLastRow?: boolean;
  isActive?: boolean;
  isHoverable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const TableRow = ({
  children,
  isLastRow = false,
  isActive = false,
  isHoverable = true,
  className,
  style,
  onClick,
  ...props
}: TableRowProps) => {
  return (
    <tr
      style={style}
      className={cn(
        'bg-white transition-colors duration-200',
        isHoverable && 'hover:bg-[#F5F5F5]',
        isActive && 'bg-[#EBEBEB]',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  );
};
