'use client';

import { cn } from '@heroui/react';
import { X } from '@phosphor-icons/react';
import React from 'react';

import { NADisplayProps } from '@/constants/naSelection';

/**
 * NADisplay Component
 * Displays N/A selection state with clear functionality
 * Used in Organization/Program column when N/A is selected
 */
const NADisplay = React.memo<NADisplayProps>(
  ({ onClear, label = 'N/A', className }) => {
    return (
      <div
        className={cn(
          // Container styles
          'inline-flex items-center gap-[8px] h-[24px]',
          'px-[8px] ',
          'bg-[rgb(245,245,245)] rounded-[5px]',
          // Custom className
          className,
        )}
      >
        {/* N/A Text Label */}
        <span className="text-[13px] font-[600] text-black/50">{label}</span>

        {/* Clear Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClear();
          }}
          className="flex items-center justify-center text-black/60 transition-colors hover:text-black"
          aria-label="Clear N/A selection"
        >
          <X size={16} />
        </button>
      </div>
    );
  },
);

NADisplay.displayName = 'NADisplay';

export default NADisplay;
