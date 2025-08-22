'use client';

import { cn } from '@heroui/react';
import { FC } from 'react';

import { Button } from '@/components/base/button';
import { InfoIcon } from '@/components/icons';

interface EmptyFilterStateProps {
  filterType: 'pending' | 'empty' | 'general';
  onResetFilters: () => void;
  className?: string;
}

/**
 * Component to display when filtered results are empty
 */
const EmptyFilterState: FC<EmptyFilterStateProps> = ({
  filterType,
  onResetFilters,
  className,
}) => {
  const getMessage = () => {
    switch (filterType) {
      case 'pending':
        return 'No pending items found. There are no items with active proposals.';
      case 'empty':
        return 'No empty items found. All items have data.';
      case 'general':
      default:
        return 'No items match the current filter criteria.';
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'py-[60px] px-[20px]',
        'bg-gray-50 rounded-[10px]',
        className,
      )}
    >
      <div className="mb-[20px] flex size-[60px] items-center justify-center rounded-full bg-gray-100">
        <InfoIcon className="size-[30px] text-gray-400" />
      </div>

      <h3 className="mb-[10px] text-[18px] font-semibold text-gray-700">
        No Results Found
      </h3>

      <p className="mb-[20px] max-w-[400px] text-center text-[14px] text-gray-500">
        {getMessage()}
      </p>

      <Button
        size="sm"
        color="primary"
        onClick={onResetFilters}
        className="min-w-[120px]"
      >
        Reset Filters
      </Button>
    </div>
  );
};

export default EmptyFilterState;
