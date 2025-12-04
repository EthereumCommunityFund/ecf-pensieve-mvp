'use client';

import { cn } from '@heroui/react';
import { ReactNode } from 'react';

import { DEFAULT_SENTIMENT_VALUE } from './sentiment/sentimentConfig';
import { SentimentSelector } from './sentiment/SentimentSelector';

type TopbarFiltersProps = {
  statusTabs: string[];
  activeStatus?: string;
  onStatusChange?: (value: string) => void;
  sortOptions: string[];
  activeSort?: string;
  onSortChange?: (value: string) => void;
  sentimentOptions: string[];
  selectedSentiment?: string;
  onSentimentChange?: (value: string) => void;
  secondaryAction?: ReactNode;
  renderStatusLabel?: (value: string) => ReactNode;
};

export function TopbarFilters({
  statusTabs,
  activeStatus = statusTabs[0],
  onStatusChange,
  sortOptions,
  activeSort = sortOptions[0],
  onSortChange,
  sentimentOptions,
  selectedSentiment = DEFAULT_SENTIMENT_VALUE,
  onSentimentChange,
  secondaryAction,
  renderStatusLabel,
}: TopbarFiltersProps) {
  const tabLabel = (label: string) =>
    label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-black/10">
      <div className="flex min-h-[40px] min-w-0 flex-1 flex-wrap items-center gap-2">
        {statusTabs.map((tab) => {
          const normalizedTab = tab.toLowerCase();
          const isActive = normalizedTab === activeStatus?.toLowerCase();
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onStatusChange?.(tab)}
              className={cn(
                'relative flex h-10 items-center px-2 text-[15px] font-semibold tracking-tight transition-colors duration-150',
                isActive ? 'text-black' : 'text-black/50 hover:text-black/80',
              )}
            >
              {renderStatusLabel ? renderStatusLabel(tab) : tabLabel(tab)}
              <span
                className={cn(
                  'pointer-events-none absolute inset-x-0 bottom-0 h-[2px] rounded-full transition-colors duration-150',
                  isActive ? 'bg-black' : 'bg-transparent',
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-[2px] rounded-[5px] border border-black/10 bg-white p-[2px]">
          {sortOptions.map((option) => {
            const isActive = option === activeSort;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onSortChange?.(option)}
                className={cn(
                  'flex h-[26px] min-w-[60px] items-center justify-center rounded-[4px] px-3 text-[14px] font-semibold capitalize transition-colors duration-150',
                  isActive
                    ? 'bg-[#3d3d3d] text-white'
                    : 'text-black/55 hover:text-black',
                )}
              >
                {tabLabel(option)}
              </button>
            );
          })}
        </div>

        {secondaryAction}

        <SentimentSelector
          options={sentimentOptions}
          value={selectedSentiment}
          onChange={onSentimentChange}
          defaultValue={DEFAULT_SENTIMENT_VALUE}
        />
      </div>
    </div>
  );
}
