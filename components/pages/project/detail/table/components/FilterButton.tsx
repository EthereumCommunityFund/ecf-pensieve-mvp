'use client';

import { cn } from '@heroui/react';
import { FC, ReactNode } from 'react';

import { Button } from '@/components/base/button';

interface FilterButtonProps {
  label: string;
  icon?: ReactNode;
  isActive: boolean;
  count?: number;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
}

/**
 * Reusable filter button component with active state and count display
 */
const FilterButton: FC<FilterButtonProps> = ({
  label,
  icon,
  isActive,
  count,
  onClick,
  variant = 'secondary',
  disabled = false,
  className,
}) => {
  return (
    <Button
      size="sm"
      color={variant}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex items-center gap-[6px] h-[32px] px-[12px]',
        'font-medium text-[14px] leading-[20px]',
        'transition-all duration-200',
        isActive
          ? 'bg-blue-100 text-blue-600 border-blue-300 hover:bg-blue-200'
          : 'bg-black/5 text-black hover:bg-black/10 border-black/10',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            'ml-[4px] px-[6px] py-[1px] rounded-[10px]',
            'text-[12px] font-semibold',
            isActive ? 'bg-blue-600 text-white' : 'bg-black/10 text-black/60',
          )}
        >
          {count}
        </span>
      )}
    </Button>
  );
};

export default FilterButton;
