'use client';

import {
  ArrowBendUpLeft,
  CaretCircleUp,
  CaretDown,
  ChartBar,
  ChatCircle,
  ThumbsDown,
} from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';

import { MetricPill } from './MetricPill';
import type { SentimentStat } from './SentimentCard';
import { TagPill } from './TagPill';

type ThreadSurfaceProps = {
  answerHighlights: string[];
  sentimentStats: SentimentStat[];
};

type SentimentOption = {
  value: 'all' | 'positive' | 'balanced' | 'critical';
  label: string;
  description: string;
};

type DiscussionComment = {
  id: string;
  author: string;
  timestamp: string;
  content: string[];
  tags: string[];
  isOp?: boolean;
  isReply?: boolean;
  score: number;
  chartValues: number[];
  reactions?: Array<'arrow' | 'thumbs-down'>;
};

const SENTIMENT_OPTIONS: SentimentOption[] = [
  {
    value: 'all',
    label: 'All sentiment',
    description: 'Show every reaction regardless of tone.',
  },
  {
    value: 'positive',
    label: 'Positive first',
    description: 'Highlight optimistic answers at the top.',
  },
  {
    value: 'balanced',
    label: 'Balanced mix',
    description: 'Blend positive and critical responses evenly.',
  },
  {
    value: 'critical',
    label: 'Critical focus',
    description: 'Surface the most skeptical viewpoints.',
  },
];

const discussionComments: DiscussionComment[] = [
  {
    id: 'comment-1',
    author: 'Username',
    timestamp: 'a week ago',
    content: ['Here is a comment'],
    tags: ['Reno disagrees with this', 'Reno finds this provocative'],
    score: 4,
    chartValues: [65, 30, 45, 80, 50],
  },
  {
    id: 'comment-2',
    author: 'Username (OP)',
    timestamp: 'a week ago',
    content: ['Here is a response from OP'],
    tags: [
      'Reno agrees with this',
      'Reno finds this insightful',
      'Reno recommends this',
    ],
    isOp: true,
    score: 4,
    chartValues: [20, 45, 35, 55, 70],
    reactions: ['arrow', 'thumbs-down'],
  },
  {
    id: 'comment-3',
    author: 'Username',
    timestamp: '5 days ago',
    content: ['Follow up thought from community'],
    tags: ['Reno finds this provocative'],
    isReply: true,
    score: 2,
    chartValues: [30, 30, 30, 30, 30],
  },
];

export function ThreadSurface({
  answerHighlights,
  sentimentStats,
}: ThreadSurfaceProps) {
  type ThreadSurfaceTab = 'answers' | 'discuss';
  const [activeTab, setActiveTab] = useState<ThreadSurfaceTab>('answers');
  const [sortOption, setSortOption] = useState<'top' | 'new'>('top');
  const [selectedSentiment, setSelectedSentiment] = useState<SentimentOption>(
    SENTIMENT_OPTIONS[0],
  );
  const [isSentimentOpen, setIsSentimentOpen] = useState(false);
  const sentimentSelectRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sentimentSelectRef.current &&
        event.target instanceof Node &&
        !sentimentSelectRef.current.contains(event.target)
      ) {
        setIsSentimentOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabButtonClasses = (tab: ThreadSurfaceTab) =>
    tab === activeTab
      ? 'relative flex items-center gap-2 border-b-2 border-black pb-2 text-black'
      : 'flex items-center gap-2 border-b-2 border-transparent pb-2 text-black/60 hover:text-black';

  const sentimentButtonLabel =
    selectedSentiment.value === 'all' ? 'Sentiment' : selectedSentiment.label;

  return (
    <div className="rounded-2xl border border-[#e7e4df] bg-white">
      <div className="flex flex-wrap items-center justify-between border-b border-[#e7e4df] px-6 py-4">
        <div className="flex flex-wrap items-center gap-6 text-sm font-semibold">
          <button
            type="button"
            aria-pressed={activeTab === 'answers'}
            className={tabButtonClasses('answers')}
            onClick={() => setActiveTab('answers')}
          >
            Answers
            <span className="rounded-md bg-black/10 px-1 text-xs font-bold text-black/60">
              2
            </span>
          </button>
          <button
            type="button"
            aria-pressed={activeTab === 'discuss'}
            className={tabButtonClasses('discuss')}
            onClick={() => setActiveTab('discuss')}
          >
            Discuss
            <span className="rounded-md bg-black/5 px-1 text-xs font-bold text-black/40">
              5
            </span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-1 rounded-md border border-black/10 bg-[#ebebeb] p-1">
            {(['top', 'new'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={sortOption === option}
                className={
                  sortOption === option
                    ? 'min-w-[64px] rounded-md border-2 border-black bg-white px-3 py-1 font-semibold text-black'
                    : 'min-w-[64px] rounded-md px-3 py-1 font-semibold text-black/50 hover:text-black'
                }
                onClick={() => setSortOption(option)}
              >
                {option === 'top' ? 'Top' : 'New'}
              </button>
            ))}
          </div>
          <div className="relative" ref={sentimentSelectRef}>
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isSentimentOpen}
              className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-[#ebebeb] px-3 py-1 font-semibold text-black/60 transition hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
              onClick={() => setIsSentimentOpen((prev) => !prev)}
            >
              <ChartBar className="size-4 text-black/60" weight="bold" />
              <span>{sentimentButtonLabel}</span>
              <CaretDown className="size-4 text-black/40" weight="bold" />
            </button>
            {isSentimentOpen ? (
              <div className="absolute right-0 z-10 mt-2 w-56 overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl">
                <div role="listbox" aria-label="Sentiment filter options">
                  {SENTIMENT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={selectedSentiment.value === option.value}
                      className={`w-full px-4 py-3 text-left text-sm transition hover:bg-black/5 ${
                        selectedSentiment.value === option.value
                          ? 'bg-black/5 font-semibold text-black'
                          : 'text-black/70'
                      }`}
                      onClick={() => {
                        setSelectedSentiment(option);
                        setIsSentimentOpen(false);
                      }}
                    >
                      <span className="block">{option.label}</span>
                      <span className="text-xs text-black/50">
                        {option.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="space-y-6 p-6">
        {activeTab === 'answers' ? (
          <div className="space-y-6">
            <AnswerCard
              answerHighlights={answerHighlights}
              sentimentStats={sentimentStats}
            />
            <CommentThread />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#e7e4df] pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-black">
                Discussion comments
                <span className="rounded-md bg-black/10 px-1 text-xs font-bold text-black/60">
                  {String(discussionComments.length).padStart(2, '0')}
                </span>
              </div>
              <button className="rounded-md border border-black/10 bg-neutral-50 px-4 py-1 text-sm font-semibold text-black">
                Post Comment
              </button>
            </div>
            <div className="space-y-4">
              {discussionComments.map((comment, index) => (
                <DiscussionCommentCard
                  key={comment.id}
                  comment={comment}
                  showConnector={index === 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AnswerCard({
  answerHighlights,
  sentimentStats,
}: {
  answerHighlights: string[];
  sentimentStats: SentimentStat[];
}) {
  return (
    <div className="rounded-2xl border border-[#e7e4df] bg-white p-6">
      <div className="flex gap-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-black/5 text-lg font-semibold text-black">
          U
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-base font-semibold text-black">Username</p>
            <span className="rounded-md border border-[#43bd9b] bg-[#43bd9b]/10 px-3 py-1 text-xs font-semibold text-[#1b9573]">
              Highest voted answer
            </span>
            <span className="rounded-md border border-[#43bd9b] bg-[#43bd9b]/10 px-3 py-1 text-xs font-semibold text-[#1b9573]">
              Voted by Original Poster
            </span>
          </div>
          <div className="space-y-3 text-sm text-black/80">
            <p>
              Ethereum’s mission is to build an open, programmable financial +
              application system that anyone can use, without needing permission
              from banks, governments, or corporations.
            </p>
            <p>
              It wants to replace middlemen with code that anyone can verify and
              no one can control.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              {answerHighlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
            <p>
              TL;DR — Ethereum’s mission is to decentralize power in digital
              systems so ownership and control are shared by users instead of
              gatekeepers.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-black/60">
            <span>a week ago</span>
            <div className="flex items-center gap-2 rounded-xl bg-neutral-100 px-3 py-1">
              <ChartBar className="size-4 text-black/60" weight="bold" />
              <span className="text-black">4</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-neutral-100 px-3 py-1">
              <CaretCircleUp className="size-4 text-[#64c0a5]" weight="bold" />
              <span className="text-[#64c0a5]">2.5k</span>
            </div>
          </div>
          <div className="rounded-xl border border-black/10 p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-black/50">
              Sentiment breakdown
            </h4>
            <div className="space-y-3">
              {sentimentStats.map((stat) => (
                <div key={stat.label}>
                  <div className="flex items-center justify-between text-sm font-medium text-black">
                    <div className="flex items-center gap-2">
                      <stat.icon className="size-4 text-black/50" />
                      <span>{stat.label}</span>
                    </div>
                    <span className="text-black/60">{stat.value}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-black/5">
                    <div
                      className={`h-2 rounded-full ${stat.accent}`}
                      style={{ width: `${stat.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-black/50">
            <div className="flex flex-wrap gap-3">
              <TagPill label="Reno disagrees with this" />
              <TagPill label="Reno agrees with this" />
              <TagPill label="Reno finds this insightful" />
              <TagPill label="Reno recommends this" />
            </div>
            <div className="flex flex-wrap gap-3">
              <MetricPill icon={ChartBar} label="Q Points" value="4" />
              <button className="rounded-md border border-black/20 px-3 py-1 text-xs font-semibold text-black/80">
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentThread() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#e7e4df] pb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-black">
          Comments
          <span className="rounded-md bg-black/10 px-1 text-xs font-bold text-black/60">
            00
          </span>
        </div>
        <button className="rounded-md border border-black/10 bg-neutral-50 px-4 py-1 text-sm font-semibold text-black">
          Post Comment
        </button>
      </div>
      <div className="flex gap-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-black/5 text-sm font-semibold text-black">
          R
        </div>
        <div className="flex-1 space-y-3 rounded-2xl border border-[#e7e4df] p-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <p className="font-semibold text-black">Reno</p>
            <span className="rounded-md border border-white bg-[#43bd9b]/20 px-2 py-0.5 text-xs font-semibold text-[#1b9573]">
              OP
            </span>
            <span className="text-xs font-semibold text-black/50">
              a week ago
            </span>
          </div>
          <div className="space-y-2 text-sm text-black/80">
            <p>Here is a response from OP</p>
            <span className="text-xs font-semibold text-black/50">
              EDITED 000/00/00
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-black/50">
            <TagPill label="Reno disagrees with this" />
            <TagPill label="Reno finds this provocative" />
            <TagPill label="Reno finds this insightful" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MetricPill icon={ChartBar} label="Q Points" value="4" />
            <button className="rounded-md border border-black/10 bg-black/5 px-3 py-1 text-xs font-semibold text-black">
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiscussionCommentCard({
  comment,
  showConnector = false,
}: {
  comment: DiscussionComment;
  showConnector?: boolean;
}) {
  return (
    <div className={`relative flex gap-4 ${comment.isReply ? 'pl-8' : ''}`}>
      {showConnector ? (
        <span className="pointer-events-none absolute bottom-[-40px] left-[22px] top-10 w-px bg-[#e7e4df]" />
      ) : null}
      <div className="flex flex-col items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-black/5 text-sm font-semibold text-black">
          {comment.author.charAt(0)}
        </div>
        {comment.reactions ? (
          <div className="flex flex-col items-center gap-2 text-black/60">
            {comment.reactions.map((reaction) => (
              <div
                key={reaction}
                className="flex size-8 items-center justify-center rounded-full border border-black/10 bg-black/5"
              >
                {reaction === 'arrow' ? (
                  <ArrowBendUpLeft className="size-4" />
                ) : (
                  <ThumbsDown className="size-4" />
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex-1 space-y-4 rounded-2xl border border-[#e7e4df] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="inline-flex items-center gap-2 text-black">
              <ChatCircle className="size-5 text-black/60" weight="fill" />
              <p className="font-semibold">{comment.author}</p>
            </div>
            {comment.isOp ? (
              <span className="rounded-md border border-white bg-[#43bd9b]/20 px-2 py-0.5 text-xs font-semibold text-[#1b9573]">
                OP
              </span>
            ) : null}
            <span className="text-xs font-semibold text-black/50">
              {comment.timestamp}
            </span>
          </div>
          <div className="flex items-end gap-1 rounded-md border border-black/10 bg-black/5 px-2 py-1">
            {comment.chartValues.map((value, index) => (
              <span
                key={`${comment.id}-${value}-${index}`}
                className="flex h-8 w-1.5 items-end rounded-full bg-black/10"
              >
                <span
                  className="w-full rounded-full bg-black/50"
                  style={{
                    height: `${Math.min(Math.max(value, 8), 100)}%`,
                  }}
                />
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-2 text-sm text-black/80">
          {comment.content.map((text) => (
            <p key={text}>{text}</p>
          ))}
          {comment.isOp ? (
            <span className="text-xs font-semibold text-black/50">
              EDITED 000/00/00
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-black/60">
          {comment.tags.map((tag) => (
            <TagPill key={tag} label={tag} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-black/70">
          <div className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-black/5 px-3 py-1">
            <ChartBar className="size-4 text-black/60" weight="bold" />
            {comment.score}
          </div>
          <button className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-black/5 px-3 py-1 text-xs font-semibold text-black">
            Reply
            <ArrowBendUpLeft className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
