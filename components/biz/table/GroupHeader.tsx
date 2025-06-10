'use client';

import { cn } from '@heroui/react';
import { ReactNode } from 'react';

export interface GroupHeaderProps {
  title: string;
  description?: string;
  className?: string;
  style?: React.CSSProperties;
  colSpan?: number;
  children?: ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
  isClickable?: boolean;
}

/**
 * GroupHeader component for table grouping
 *
 * Used to display group headers within table rows to visually separate
 * related items into logical groups while maintaining table structure.
 *
 * @example
 * ```tsx
 * <GroupHeader
 *   title="Project Links"
 *   description="External links and resources"
 *   colSpan={4}
 * />
 * ```
 */
export const GroupHeader = ({
  title,
  description,
  className,
  style,
  colSpan = 4,
  children,
  isExpanded = true,
  onToggle,
  isClickable = true,
}: GroupHeaderProps) => {
  const handleClick = () => {
    if (isClickable && onToggle) {
      onToggle();
    }
  };

  return (
    <tr
      className={cn(
        'bg-[#F5F5F5]  border-black/5',
        isClickable && 'cursor-pointer hover:bg-[#F0F1F2]',
        className,
      )}
      style={style}
      onClick={handleClick}
    >
      <td className="px-[20px] py-[8px]" colSpan={colSpan}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            {/* Expand/Collapse Icon */}
            {isClickable && (
              <div className="flex size-[16px] items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={cn(
                    'transition-transform duration-200',
                    isExpanded ? 'rotate-90' : 'rotate-0',
                  )}
                >
                  <path
                    d="M4.5 2L8.5 6L4.5 10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}

            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-black/80">
                {title}
              </span>
              {description && (
                <span className="mt-[2px] font-sans text-[12px] text-black/60">
                  {description}
                </span>
              )}
            </div>
          </div>
          {children}
        </div>
      </td>
    </tr>
  );
};

export default GroupHeader;
