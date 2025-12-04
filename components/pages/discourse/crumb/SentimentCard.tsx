'use client';

import { ChartBar } from '@phosphor-icons/react';

import { Button } from '@/components/base';

import {
  defaultSentimentDisplay,
  fallbackSentiments,
  sentimentDefinitions,
  SentimentKey,
  SentimentMetric,
} from '../common/sentiment/sentimentConfig';

type SentimentCardProps = {
  sentiments?: SentimentMetric[];
  totalVotes?: number;
};

export function SentimentCard({ sentiments, totalVotes }: SentimentCardProps) {
  const stats =
    sentiments && sentiments.length ? sentiments : fallbackSentiments;

  return (
    <section className="rounded-[16px] border border-black/10 bg-white p-5 shadow-[0_10px_20px_rgba(15,23,42,0.05)]">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-black/60">
            <ChartBar size={18} weight="bold" className="text-black/50" />
            User Sentiment
          </p>
          {typeof totalVotes === 'number' ? (
            <p className="mt-1 text-xs uppercase tracking-[0.15em] text-black/50">
              {totalVotes} voted
            </p>
          ) : null}
        </div>
      </header>
      <div className="space-y-4">
        {stats.map((stat) => {
          const definition =
            sentimentDefinitions[stat.key as SentimentKey] ||
            defaultSentimentDisplay;
          const percentage = Number.isFinite(stat.percentage)
            ? Math.max(0, Math.min(100, stat.percentage))
            : 0;

          return (
            <div key={`${stat.key}-${percentage}`} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-black/80">
                  <definition.Icon
                    size={20}
                    weight="fill"
                    style={{ color: definition.color }}
                  />
                  <span>{definition.label}</span>
                </div>
                <span className="text-black/60">{percentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-black/5">
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
      <Button
        className="ml-auto mt-5 block text-right text-sm font-semibold text-black/50"
        type="button"
      >
        What is User Sentiment?
      </Button>
    </section>
  );
}
