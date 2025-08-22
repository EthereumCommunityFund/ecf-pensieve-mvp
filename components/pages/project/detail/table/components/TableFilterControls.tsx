'use client';

import { cn } from '@heroui/react';
import { FC } from 'react';

import {
  CollapseItemIcon,
  EmptyIcon,
  PendingIcon,
  ShowMetricsIcon,
} from '@/components/icons';

import FilterButton from './FilterButton';

interface TableFilterControlsProps {
  // Global collapse state
  globalCollapseState: 'expanded' | 'collapsed' | 'mixed';
  onToggleGlobalCollapse: () => void;

  // Filter states
  showPendingOnly: boolean;
  showEmptyOnly: boolean;
  onTogglePendingFilter: () => void;
  onToggleEmptyFilter: () => void;

  // Global metrics control
  globalMetricsVisible: boolean;
  onToggleGlobalMetrics: () => void;

  // Data statistics
  totalItems: number;
  pendingItemsCount: number;
  emptyItemsCount: number;

  // Reset functionality
  onResetFilters: () => void;
  hasActiveFilters: boolean;

  // Additional props
  className?: string;
}

/**
 * Main filter controls component for the project detail table
 * Provides filtering and display control options
 */
const TableFilterControls: FC<TableFilterControlsProps> = ({
  globalCollapseState,
  onToggleGlobalCollapse,
  showPendingOnly,
  showEmptyOnly,
  onTogglePendingFilter,
  onToggleEmptyFilter,
  globalMetricsVisible,
  onToggleGlobalMetrics,
  totalItems,
  pendingItemsCount,
  emptyItemsCount,
  onResetFilters,
  hasActiveFilters,
  className,
}) => {
  // Determine collapse button label
  const collapseButtonLabel =
    globalCollapseState === 'collapsed'
      ? 'Expand All Items'
      : 'Collapse All Items';

  // Determine metrics button label
  const metricsButtonLabel = globalMetricsVisible
    ? 'Hide Metrics'
    : 'Show Metrics';

  return (
    <div
      className={cn(
        'flex items-center justify-between',
        'px-[20px] py-[12px]',
        'bg-white rounded-[10px] border border-black/5',
        'shadow-sm',
        className,
      )}
    >
      {/* Left side - Sort & Filter label */}
      <div className="flex items-center gap-[20px]">
        <span className="text-[14px] font-semibold text-black/60">
          Sort & Filter Page:
        </span>

        {/* Filter buttons */}
        <div className="flex items-center gap-[10px]">
          {/* Collapse/Expand All */}
          <FilterButton
            label={collapseButtonLabel}
            icon={<CollapseItemIcon className="size-[16px]" />}
            isActive={false}
            onClick={onToggleGlobalCollapse}
          />

          {/* Show Metrics */}
          <FilterButton
            label={metricsButtonLabel}
            icon={<ShowMetricsIcon className="size-[16px]" />}
            isActive={globalMetricsVisible}
            onClick={onToggleGlobalMetrics}
          />

          {/* Pending Items Filter */}
          <FilterButton
            label="Pending Items"
            icon={<PendingIcon className="size-[16px]" />}
            isActive={showPendingOnly}
            count={pendingItemsCount}
            onClick={onTogglePendingFilter}
            disabled={emptyItemsCount === 0 && !showPendingOnly}
          />

          {/* Empty Items Filter */}
          <FilterButton
            label="Empty Items"
            icon={<EmptyIcon className="size-[16px]" />}
            isActive={showEmptyOnly}
            count={emptyItemsCount}
            onClick={onToggleEmptyFilter}
            disabled={emptyItemsCount === 0 && !showEmptyOnly}
          />
        </div>
      </div>

      {/* Right side - Reset filters */}
      {hasActiveFilters && (
        <button
          onClick={onResetFilters}
          className={cn(
            'text-[14px] font-medium text-blue-600',
            'hover:text-blue-700 transition-colors',
            'underline underline-offset-2',
          )}
        >
          Reset Filters
        </button>
      )}
    </div>
  );
};

export default TableFilterControls;
