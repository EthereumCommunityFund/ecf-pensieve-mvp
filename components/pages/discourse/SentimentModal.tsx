'use client';

import { X } from '@phosphor-icons/react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/base';

import {
  defaultSentimentDisplay,
  fallbackSentiments,
  sentimentDefinitions,
  SentimentKey,
  SentimentMetric,
} from './sentimentConfig';

export type SentimentModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  excerpt: string;
  sentiments?: SentimentMetric[];
  totalVotes?: number;
};

export function SentimentModal({
  open,
  onClose,
  title,
  excerpt,
  sentiments,
  totalVotes,
}: SentimentModalProps) {
  if (!open) return null;

  const stats =
    sentiments && sentiments.length ? sentiments : fallbackSentiments;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[360px] rounded-[16px] bg-white p-6 shadow-[0_25px_65px_rgba(15,23,42,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-black/60">
              User Sentiment
            </p>
            <h3 className="mt-1 text-lg font-semibold text-[#1b1b1f]">
              {title}
            </h3>
            <p className="mt-1 text-sm text-black/60">{excerpt}</p>
            {totalVotes ? (
              <p className="mt-2 text-xs uppercase tracking-[0.15em] text-black/50">
                {totalVotes} voted
              </p>
            ) : null}
          </div>
          <Button
            isIconOnly
            onClick={onClose}
            aria-label="Close sentiment modal"
            className="rounded-full border-none bg-transparent p-1 text-black/60 hover:bg-black/5"
          >
            <X size={20} />
          </Button>
        </header>

        <div className="space-y-4">
          {stats.map((stat) => {
            const definition =
              sentimentDefinitions[stat.key as SentimentKey] ||
              defaultSentimentDisplay;
            return (
              <div key={`${stat.key}-${stat.percentage}`} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-black/70">
                    <definition.Icon
                      size={20}
                      weight="fill"
                      style={{ color: definition.color }}
                    />
                    <span>{definition.label}</span>
                  </div>
                  <span className="text-black/60">
                    {stat.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-black/5">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, stat.percentage)}%`,
                      backgroundColor: definition.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-right text-sm text-black/50">
          What is User Sentiment?
        </div>
      </div>
    </div>,
    document.body,
  );
}
