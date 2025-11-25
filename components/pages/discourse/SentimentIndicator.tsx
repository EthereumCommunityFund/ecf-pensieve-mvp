'use client';

import { sentimentDefinitions, SentimentMetric } from './sentimentConfig';

const MAX_BAR_HEIGHT = 16;
const MIN_BAR_HEIGHT = 6;

function normalizeHeight(percentage: number) {
  const clamped = Math.max(5, Math.min(percentage, 100));
  return (clamped / 100) * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT) + MIN_BAR_HEIGHT;
}

type SentimentIndicatorProps = {
  sentiments?: SentimentMetric[];
  onClick?: () => void;
};

export function SentimentIndicator({
  sentiments = [],
  onClick,
}: SentimentIndicatorProps) {
  if (!sentiments.length) {
    return null;
  }

  const bars = sentiments.slice(0, 4);

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-end gap-[3px] rounded-[8px] border border-black/10 bg-white p-2 shadow-sm transition hover:-translate-y-px"
      aria-label="View sentiment breakdown"
    >
      {bars.map((bar) => {
        const definition = sentimentDefinitions[bar.key];
        return (
          <span
            key={`${bar.key}-${bar.percentage}`}
            className="w-[6px] rounded-full"
            style={{
              height: `${normalizeHeight(bar.percentage)}px`,
              backgroundColor: definition?.color || '#d0d0d0',
            }}
          />
        );
      })}
    </button>
  );
}
