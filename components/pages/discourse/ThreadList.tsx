'use client';

import { CaretCircleUp, CheckSquare, Question } from '@phosphor-icons/react';
import { KeyboardEvent, useMemo, useState } from 'react';

import { SentimentIndicator } from './SentimentIndicator';
import { SentimentModal } from './SentimentModal';
import { SentimentMetric } from './sentimentConfig';

export type ThreadMeta = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  timeAgo: string;
  replies: number;
  votes: number;
  badge?: string;
  status?: string;
  tag?: string;
  sentiment?: string;
  answeredCount?: number;
  sentimentBreakdown?: SentimentMetric[];
  totalSentimentVotes?: number;
};

type ThreadListProps = {
  threads: ThreadMeta[];
  emptyMessage?: string;
  onThreadSelect?: (thread: ThreadMeta) => void;
};

type ThreadItemProps = {
  thread: ThreadMeta;
  onSentimentClick: (thread: ThreadMeta) => void;
  onSelect?: (thread: ThreadMeta) => void;
};

function ThreadItem({ thread, onSentimentClick, onSelect }: ThreadItemProps) {
  const authorInitial = thread.author?.[0]?.toUpperCase() ?? '?';
  const hasAnswers = typeof thread.answeredCount === 'number';
  const clickableProps = onSelect
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick: () => onSelect(thread),
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(thread);
          }
        },
      }
    : {};

  return (
    <article
      className={`flex flex-col gap-4 rounded-[10px] border border-black/10 bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] ${
        onSelect ? 'cursor-pointer transition hover:-translate-y-0.5' : ''
      }`}
      {...clickableProps}
    >
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-black/70">
            {thread.badge ? (
              <span className="inline-flex items-center gap-1 rounded-[4px] border border-black/10 bg-[#f5f5f5] px-2.5 py-1 text-[11px] uppercase tracking-wide text-black">
                <Question size={14} className="text-black/50" />
                {thread.badge}
              </span>
            ) : null}
            {hasAnswers ? (
              <span className="inline-flex items-center gap-1 rounded-[4px] border border-[#cfe8dd] bg-[#f4fcf8] px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#43bd9b]">
                <CheckSquare
                  size={16}
                  weight="fill"
                  className="text-[#43bd9b]"
                />
                {thread.answeredCount}
              </span>
            ) : null}
          </div>
          {thread.sentimentBreakdown?.length ? (
            <SentimentIndicator
              sentiments={thread.sentimentBreakdown}
              onClick={() => onSentimentClick(thread)}
            />
          ) : null}
        </div>

        <div className="flex gap-3 sm:flex-row sm:items-start">
          <div className="flex-1 space-y-2">
            <h2 className="text-[18px] font-semibold text-[#202023]">
              {thread.title}
            </h2>
            <p className="text-[14px] leading-5 text-black/70">
              {thread.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[12px] uppercase tracking-[0.12em] text-black/50">
              <span>BY:</span>
              <span className="flex items-center gap-2 text-[13px] tracking-normal text-black">
                <span className="inline-flex size-6 items-center justify-center rounded-full bg-black/10 text-[11px] font-semibold text-black/50">
                  {authorInitial}
                </span>
                {thread.author}
              </span>
              <span className="tracking-normal text-black/60">
                {thread.timeAgo}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 sm:ml-auto">
            <div className="flex flex-col items-center gap-1 text-sm text-black">
              <button
                type="button"
                className={`flex size-10 items-center justify-center rounded-full text-white transition hover:-translate-y-0.5 ${
                  hasAnswers ? 'bg-black/30' : 'bg-black'
                }`}
                aria-label="Upvote"
              >
                <CaretCircleUp size={22} weight="fill" />
              </button>
              <span className="text-[13px] font-semibold">{thread.votes}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ThreadList({
  threads,
  emptyMessage,
  onThreadSelect,
}: ThreadListProps) {
  const [activeSentimentThread, setActiveSentimentThread] =
    useState<ThreadMeta | null>(null);

  const renderedThreads = useMemo(() => {
    if (!threads.length) {
      return null;
    }

    return threads.map((thread) => (
      <ThreadItem
        key={thread.id}
        thread={thread}
        onSentimentClick={setActiveSentimentThread}
        onSelect={onThreadSelect}
      />
    ));
  }, [threads, onThreadSelect]);

  if (!renderedThreads) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
        {emptyMessage || 'No threads yet.'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {renderedThreads}

      <SentimentModal
        open={Boolean(activeSentimentThread)}
        onClose={() => setActiveSentimentThread(null)}
        title={activeSentimentThread?.title || ''}
        excerpt={activeSentimentThread?.excerpt || ''}
        totalVotes={activeSentimentThread?.totalSentimentVotes}
        sentiments={activeSentimentThread?.sentimentBreakdown}
      />
    </div>
  );
}
