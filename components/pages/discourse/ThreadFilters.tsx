'use client';

import { cn } from '@heroui/react';
import { CaretDown } from '@phosphor-icons/react';
import { ReactNode, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/base';

import {
  defaultSentimentDisplay,
  SentimentDefinition,
  sentimentDefinitions,
  SentimentKey,
} from './sentimentConfig';

const DEFAULT_SENTIMENT_VALUE = 'all';

type ThreadFiltersProps = {
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
};

export function ThreadFilters({
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
}: ThreadFiltersProps) {
  const tabLabel = (label: string) =>
    label.charAt(0).toUpperCase() + label.slice(1);

  const normalizedSentiment = selectedSentiment || DEFAULT_SENTIMENT_VALUE;
  const sentimentKey = normalizedSentiment as SentimentKey;
  const activeSentiment =
    normalizedSentiment !== DEFAULT_SENTIMENT_VALUE
      ? sentimentDefinitions[sentimentKey]
      : undefined;

  const getSentimentDisplay = (value: string): SentimentDefinition =>
    sentimentDefinitions[value as SentimentKey] || defaultSentimentDisplay;

  const sentimentDisplay: SentimentDefinition =
    activeSentiment || defaultSentimentDisplay;

  const [sentimentOpen, setSentimentOpen] = useState(false);
  const sentimentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sentimentRef.current &&
        !sentimentRef.current.contains(event.target as Node)
      ) {
        setSentimentOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const dropdownOptions: { value: string; display: SentimentDefinition }[] = [
    {
      value: DEFAULT_SENTIMENT_VALUE,
      display: { ...defaultSentimentDisplay, label: 'All Sentiments' },
    },
    ...sentimentOptions.map((option) => ({
      value: option,
      display: getSentimentDisplay(option),
    })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-black/10 py-2">
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
              {tabLabel(tab)}
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

        <div ref={sentimentRef} className="relative">
          <Button
            type="button"
            onClick={() => setSentimentOpen((prev) => !prev)}
            className="inline-flex h-9 items-center gap-2 rounded-[6px] border bg-white px-3 text-sm font-semibold"
            style={{
              borderColor: activeSentiment
                ? sentimentDisplay.color
                : 'rgba(0,0,0,0.12)',
            }}
          >
            <sentimentDisplay.Icon
              size={18}
              weight={activeSentiment ? 'fill' : 'regular'}
              style={{ color: sentimentDisplay.color }}
            />
            <span style={{ color: sentimentDisplay.color }}>
              {sentimentDisplay.label}
            </span>
            <CaretDown
              size={16}
              style={{ color: sentimentDisplay.color }}
              className={`transition ${sentimentOpen ? 'rotate-180' : ''}`}
            />
          </Button>
          {sentimentOpen ? (
            <div className="absolute right-0 top-[calc(100%+6px)] z-10 w-[200px] rounded-[8px] border border-[#d7d3cc] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.12)]">
              <div className="flex flex-col p-1">
                {dropdownOptions.map(({ value, display }) => {
                  const isActiveChoice = value === normalizedSentiment;
                  return (
                    <Button
                      key={value}
                      onClick={() => {
                        onSentimentChange?.(value);
                        setSentimentOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-[6px] px-3 py-2 text-left text-sm font-semibold ${
                        isActiveChoice ? 'bg-black/5' : 'hover:bg-black/5'
                      }`}
                    >
                      <display.Icon
                        size={18}
                        weight={
                          value === DEFAULT_SENTIMENT_VALUE ? 'regular' : 'fill'
                        }
                        style={{ color: display.color }}
                      />
                      <span style={{ color: display.color }}>
                        {display.label}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
