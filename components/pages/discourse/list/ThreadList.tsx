'use client';

import { cn } from '@heroui/react';
import { CaretCircleUp, CheckCircle, CheckSquare } from '@phosphor-icons/react';
import { KeyboardEvent, useMemo, useState } from 'react';

import { Button } from '@/components/base';

import { SentimentMetric } from '../common/setiment/sentimentConfig';
import { SentimentIndicator } from '../common/setiment/SentimentIndicator';
import { SentimentModal } from '../common/setiment/SentimentModal';
import { TopicTag } from '../common/TopicTag';

export type ThreadMeta = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  timeAgo: string;
  votes?: number;
  badge?: string;
  status?: string;
  tag?: string;
  sentiment?: string;
  answeredCount?: number;
  sentimentBreakdown?: SentimentMetric[];
  totalSentimentVotes?: number;
};

type ThreadListProps = {
  isLoading: boolean;
  isFetched: boolean;
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
  const isScamThread = thread.tag?.toLowerCase().includes('scam') ?? false;
  const hasStatus = Boolean(thread.status);
  const voteCount = thread.votes ?? 0;
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
      className={`flex flex-col gap-4 rounded-[10px] px-5 py-[10px] hover:bg-[#EBEBEB] ${
        onSelect ? 'cursor-pointer transition' : ''
      }`}
      {...clickableProps}
    >
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-black/70">
            {thread.tag ? (
              <TopicTag label={thread.tag} isScam={isScamThread} />
            ) : null}
            {hasStatus ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-[4px] border px-[8px] py-[4px] text-[13px] font-semibold',
                  isScamThread
                    ? 'border-[#bb5d00]/40 bg-[#fff2e5] text-[#bb5d00]'
                    : 'border-black/10 bg-[#f5f5f5] text-black/80',
                )}
              >
                <CheckCircle
                  size={16}
                  weight="fill"
                  className={cn(
                    'text-black/60',
                    isScamThread ? 'text-[#bb5d00]' : 'text-black/50',
                  )}
                />
                {thread.status}
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
            <div className="flex flex-wrap items-center gap-3 text-[12px] tracking-[0.12em] text-black/50">
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
              <Button
                isIconOnly
                type="button"
                aria-label="Upvote"
                className="min-w-0 border-none bg-transparent p-0 transition-transform hover:scale-105 hover:opacity-80"
              >
                <CaretCircleUp
                  size={36}
                  weight="fill"
                  className={cn(hasAnswers ? 'opacity-100' : 'opacity-30')}
                />
              </Button>
              <span className="text-[13px] font-semibold">{voteCount}</span>
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
  isLoading,
  isFetched,
}: ThreadListProps) {
  const [activeSentimentThread, setActiveSentimentThread] =
    useState<ThreadMeta | null>(null);

  const renderedThreads = useMemo(() => {
    if (!isFetched && !threads.length) {
      return null;
    }

    // TODO 展示骨架屏
    return threads.map((thread) => (
      <div
        key={thread.id}
        className="border-b border-black/10 pb-[10px] last:border-0"
      >
        <ThreadItem
          thread={thread}
          onSentimentClick={setActiveSentimentThread}
          onSelect={onThreadSelect}
        />
      </div>
    ));
  }, [threads, onThreadSelect]);

  if (!renderedThreads) {
    return (
      <div className="rounded-[10px] border border-black/10 bg-white p-10 text-center text-sm text-gray-500">
        {emptyMessage || 'No threads yet.'}
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex flex-col gap-[10px]">{renderedThreads}</div>

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
