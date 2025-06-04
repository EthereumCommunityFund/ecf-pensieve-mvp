'use client';

import { ReactNode } from 'react';
import { cn } from '@heroui/react';

export interface TableRowProps {
  children: ReactNode;
  isLastRow?: boolean;
  isActive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const TableRow = ({
  children,
  isLastRow = false,
  isActive = false,
  className,
  style,
  onClick,
  ...props
}: TableRowProps) => {
  return (
    <tr
      style={style}
      className={cn(
        'bg-white hover:bg-[#F5F5F5]',
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
