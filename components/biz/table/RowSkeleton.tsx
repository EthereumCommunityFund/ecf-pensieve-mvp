'use client';

import { ReactNode } from 'react';
import { cn } from '@heroui/react';

export interface TableRowSkeletonProps {
  children?: ReactNode;
  isLastRow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const TableRowSkeleton = ({
  children,
  isLastRow = false,
  className,
  style,
  ...props
}: TableRowSkeletonProps) => {
  return (
    <tr style={style} className={cn('bg-white', className)} {...props}>
      {children}
    </tr>
  );
};
