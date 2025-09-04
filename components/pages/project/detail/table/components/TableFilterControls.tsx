'use client';

import {
  CaretUpDown,
  ChartBar,
  GitPullRequest,
  PencilCircle,
  X,
} from '@phosphor-icons/react';
import { FC } from 'react';

interface TableFilterControlsProps {
  pendingFilter: boolean;
  emptyFilter: boolean;
  isAllExpanded: boolean;
  isAllMetricsVisible: boolean;
  onTogglePendingFilter: () => void;
  onToggleEmptyFilter: () => void;
  onToggleAllExpanded: () => void;
  onToggleAllMetrics: () => void;
}

const TableFilterControls: FC<TableFilterControlsProps> = ({
  pendingFilter,
  emptyFilter,
  isAllExpanded,
  isAllMetricsVisible,
  onTogglePendingFilter,
  onToggleEmptyFilter,
  onToggleAllExpanded,
  onToggleAllMetrics,
}) => {
  // Button styles based on Figma design
  const getButtonClasses = (isActive?: boolean) => {
    const base =
      'inline-flex items-center justify-center gap-[5px] px-[10px] py-[5px] rounded-[5px] border border-black/10 cursor-pointer transition-all';
    if (isActive) {
      return `${base} bg-[#E1E1E1] hover:bg-[#D5D5D5] active:bg-[#C9C9C9]`;
    }
    return `${base} bg-transparent hover:bg-black/5 active:bg-black/10`;
  };

  const textClasses =
    'font-["Open_Sans"] font-semibold text-[13px] leading-[1.36] text-black/80';

  return (
    <div className="flex flex-wrap items-center gap-[10px]">
      <button className={getButtonClasses()} onClick={onToggleAllExpanded}>
        <CaretUpDown size={16} weight="regular" className="opacity-50" />
        <span className={textClasses}>
          {isAllExpanded ? 'Collapse All Items' : 'Expand All Items'}
        </span>
      </button>

      <button className={getButtonClasses()} onClick={onToggleAllMetrics}>
        <ChartBar size={16} weight="regular" className="opacity-50" />
        <span className={textClasses}>
          {isAllMetricsVisible ? 'Hide Metrics' : 'Show Metrics'}
        </span>
      </button>

      <button
        className={getButtonClasses(pendingFilter)}
        onClick={onTogglePendingFilter}
      >
        <GitPullRequest size={18} weight="regular" className="opacity-50" />
        <span className={textClasses}>Pending Items</span>
        {pendingFilter && (
          <X
            size={14}
            weight="bold"
            className="cursor-pointer text-black/80 hover:text-black"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePendingFilter();
            }}
          />
        )}
      </button>

      <button
        className={getButtonClasses(emptyFilter)}
        onClick={onToggleEmptyFilter}
      >
        <PencilCircle size={18} weight="regular" className="opacity-50" />
        <span className={textClasses}>Empty Items</span>
        {emptyFilter && (
          <X
            size={14}
            weight="bold"
            className="cursor-pointer text-black/80 hover:text-black"
            onClick={(e) => {
              e.stopPropagation();
              onToggleEmptyFilter();
            }}
          />
        )}
      </button>
    </div>
  );
};

export default TableFilterControls;
