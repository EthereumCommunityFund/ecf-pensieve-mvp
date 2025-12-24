'use client';

import { cn } from '@heroui/react';

import {
  defaultSentimentDisplay,
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

const normalizeSentiments = (items?: SentimentMetric[]): SentimentMetric[] =>
  sentimentOrder.map((key) => {
    const matched = items?.find((item) => item.key === key);
    return {
      key,
      percentage: matched?.percentage ?? 0,
    };
  });

type SentimentBreakdownListProps = {
  sentiments?: SentimentMetric[];
  className?: string;
};

export function SentimentBreakdownList({
  sentiments,
  className,
}: SentimentBreakdownListProps) {
  const stats = normalizeSentiments(sentiments);

  return (
    <div className={cn('space-y-[10px]', className)}>
      {stats.map((stat) => {
        const definition =
          sentimentDefinitions[stat.key as SentimentKey] ||
          defaultSentimentDisplay;
        const percentage = Math.max(0, Math.min(100, stat.percentage));

        return (
          <div key={`${stat.key}-${percentage}`} className="space-y-[5px]">
            <div className="flex h-[24px] items-center justify-between ">
              <div className="flex items-center gap-[5px]">
                <definition.Icon
                  size={24}
                  style={{ color: definition.color }}
                />
                <span className="text-[14px] text-black/70">
                  {definition.label}
                </span>
              </div>
              <span className="text-[13px] font-[500] text-[#505050]">
                {percentage.toFixed(1)}%
              </span>
            </div>
            <div className="h-[2px] rounded-full bg-black/5">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: definition.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
