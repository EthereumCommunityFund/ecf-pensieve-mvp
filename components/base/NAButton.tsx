'use client';

import { cn } from '@heroui/react';
import React from 'react';

import { NA_VALUE, NAButtonProps } from '@/constants/naSelection';

/**
 * NAButton Component
 * Button for selecting N/A option in Organization/Program column
 * Follows existing design system specifications
 */
const NAButton = React.memo<NAButtonProps>(
  ({ onClick, disabled = false, className, children = NA_VALUE }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          // Base styles
          'flex items-center justify-center',
          'h-[24px] px-[8px]',
          'border-none',
          'text-[13px] font-[600] text-black/50',
          'rounded-[5px]',
          'transition-all duration-200',
          // Background and border
          'bg-[rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.10)]',
          // Hover state
          'hover:bg-[rgba(0,0,0,0.15)]',
          // Active state
          'active:bg-black active:text-white',
          // Disabled state
          disabled && 'cursor-not-allowed opacity-50',
          // Custom className
          className,
        )}
        aria-label="Select N/A"
      >
        {children}
      </button>
    );
  },
);

NAButton.displayName = 'NAButton';

export default NAButton;
