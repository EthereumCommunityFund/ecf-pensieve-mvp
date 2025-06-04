'use client';

import { ReactNode } from 'react';
import { cn } from '@heroui/react';

export interface TableFooterProps {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  showIcon?: boolean;
  colSpan?: number;
}

export const TableFooter = ({
  children = 'Footer',
  className,
  style,
  onClick,
  showIcon = true,
  colSpan = 4,
  ...props
}: TableFooterProps) => {
  return (
    <tr
      style={style}
      className={cn(
        'bg-[#EBEBEB] border-t border-black/10',
        onClick && 'cursor-pointer hover:bg-[#E0E0E0]',
        className,
      )}
      onClick={onClick}
      {...props}
    >
      <td
        className="px-[30px] py-[10px]"
        colSpan={colSpan} // Span across all columns
      >
        <div className="flex items-center gap-[10px]">
          <span className="font-sans text-[16px] text-black opacity-60">
            {children}
          </span>
        </div>
      </td>
    </tr>
  );
};
