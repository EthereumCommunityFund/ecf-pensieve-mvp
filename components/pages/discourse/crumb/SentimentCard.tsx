'use client';

import { ChartBar } from '@phosphor-icons/react';

import type { IconComponent } from './MetricPill';

export type SentimentStat = {
  label: string;
  icon: IconComponent;
  value: number;
  accent: string;
};

type SentimentCardProps = {
  stats: SentimentStat[];
};

export function SentimentCard({ stats }: SentimentCardProps) {
  return (
    <div className="rounded-[10px] border border-black/10 bg-white p-3.5">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-black/80">
          <ChartBar className="size-5 text-[#6d6d6d]" />
          <span className="text-black/80">User Sentiment</span>
        </div>
        <p className="text-[13px] font-medium text-black/60">4 voted</p>
      </div>
      <div className="mt-3.5 space-y-2.5">
        {stats.map((stat) => (
          <div key={stat.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm font-medium text-black/80">
              <div className="flex items-center gap-2">
                <stat.icon className="size-5 text-[#7a7a7a]" />
                <span className="tracking-[0.25px] text-[#222222]/70">
                  {stat.label}
                </span>
              </div>
              <span className="text-[13px] font-semibold text-[#505050]">
                {stat.value.toFixed(1)}%
              </span>
            </div>
            <div className="h-[2px] w-full rounded-full bg-black/10">
              <div
                className={`h-full rounded-full ${stat.accent}`}
                style={{ width: `${stat.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <button
        className="ml-auto mt-4 block text-right text-[13px] font-medium text-black/50"
        type="button"
      >
        What is User Sentiment?
      </button>
    </div>
  );
}
