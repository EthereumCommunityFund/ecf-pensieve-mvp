'use client';

import { MouseEvent, useMemo } from 'react';

import {
  sentimentDefinitions,
  SentimentKey,
  SentimentMetric,
} from './sentimentConfig';

const sentimentOrder: SentimentKey[] = [
  'recommend',
  'agree',
  'insightful',
  'provocative',
  'disagree',
];

const BAR_WIDTHS = [12, 14, 7, 7, 11];
const MIN_BAR_HEIGHT = 4;
const MAX_BAR_HEIGHT = 22;

type SentimentIndicatorProps = {
  sentiments?: SentimentMetric[];
  onClick?: () => void;
};

export function SentimentIndicator({
  sentiments = [],
  onClick,
}: SentimentIndicatorProps) {
  const bars = useMemo(() => {
    const map = sentiments.reduce<Record<SentimentKey, number>>(
      (acc, metric) => {
        acc[metric.key] = metric.percentage;
        return acc;
      },
      {} as Record<SentimentKey, number>,
    );

    return sentimentOrder.map((key, index) => {
      const value = map[key] ?? 0;
      const clamped = Math.max(0, Math.min(100, value));
      const height =
        ((MAX_BAR_HEIGHT - MIN_BAR_HEIGHT) * clamped) / 100 + MIN_BAR_HEIGHT;
      return {
        key,
        height,
        width: BAR_WIDTHS[index] ?? 8,
        color: sentimentDefinitions[key]?.color || '#cccccc',
        label: sentimentDefinitions[key]?.label ?? key,
        percentage: clamped,
      };
    });
  }, [sentiments]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="View sentiment breakdown"
      className="inline-flex items-center rounded-[18px] border border-[#dfe3ee] bg-[#f7f8fb] px-2.5 py-1.5 shadow-[0px_10px_26px_rgba(31,37,56,0.15)] transition hover:-translate-y-0.5"
    >
      <div className="flex h-[28px] items-end gap-[3px]">
        {bars.map((bar) => (
          <span
            key={bar.key}
            className="rounded-[999px]"
            style={{
              width: `${bar.width}px`,
              height: `${bar.height}px`,
              backgroundColor: bar.color,
            }}
            title={`${bar.label}: ${bar.percentage.toFixed(1)}%`}
          />
        ))}
      </div>
    </button>
  );
}
