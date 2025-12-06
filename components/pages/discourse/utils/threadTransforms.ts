import { formatTimeAgo } from '@/lib/utils';
import type { RouterOutputs } from '@/types';

import {
  sentimentDefinitions,
  type SentimentKey,
  type SentimentMetric,
} from '../common/sentiment/sentimentConfig';

type ThreadListItemBase =
  RouterOutputs['projectDiscussionThread']['listThreads']['items'][0];
export type ThreadListItem = ThreadListItemBase & {
  viewerHasSupported?: boolean;
};
export type ThreadSentimentRecord = NonNullable<
  ThreadListItem['sentiments'][number]
>;

export type ThreadMeta = ThreadListItem & {
  author: string;
  authorAvatar?: string | null;
  authorInitial?: string;
  excerpt: string;
  timeAgo: string;
  badge?: string;
  status?: string;
  sentiment?: string;
  sentimentBreakdown: SentimentMetric[];
  totalSentimentVotes: number;
  dominantSentimentKey?: SentimentKey;
  tag?: string;
  votes: number;
  answeredCount?: number;
};

export const SENTIMENT_KEYS: SentimentKey[] = [
  'recommend',
  'agree',
  'insightful',
  'provocative',
  'disagree',
];

export const stripHtmlToPlainText = (value?: string | null): string => {
  if (!value) return '';
  return value
    .replace(/<br\s*\/?>(\n)?/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const truncate = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1).trim()}…`;
};

export const summarizeSentiments = (sentiments?: ThreadSentimentRecord[]) => {
  if (!sentiments?.length) {
    return {
      metrics: [] as SentimentMetric[],
      totalVotes: 0,
      dominantKey: undefined as SentimentKey | undefined,
    };
  }

  const counts: Record<SentimentKey, number> = {
    recommend: 0,
    agree: 0,
    insightful: 0,
    provocative: 0,
    disagree: 0,
  };

  let dominantKey: SentimentKey | undefined;
  let dominantCount = 0;

  for (const sentiment of sentiments) {
    const normalized = sentiment.type?.toLowerCase() as SentimentKey;
    if (normalized && SENTIMENT_KEYS.includes(normalized)) {
      counts[normalized] += 1;
      if (counts[normalized] > dominantCount) {
        dominantCount = counts[normalized];
        dominantKey = normalized;
      }
    }
  }

  const totalVotes = sentiments.length;
  const metrics: SentimentMetric[] = SENTIMENT_KEYS.filter(
    (key) => counts[key] > 0,
  ).map((key) => ({
    key,
    percentage: Math.round((counts[key] / totalVotes) * 100),
  }));

  return {
    metrics,
    totalVotes,
    dominantKey,
  };
};

export const mapThreadToMeta = (thread: ThreadListItem): ThreadMeta => {
  const plainText = stripHtmlToPlainText(thread.post);
  const excerpt = truncate(plainText, 240);
  const createdAtLabel = thread.createdAt
    ? formatTimeAgo(thread.createdAt)
    : '–';
  const summary = summarizeSentiments(thread.sentiments);
  const authorName = thread.creator?.name || 'Unknown';
  const primaryCategory = thread.category?.[0];
  const primaryTag = primaryCategory || thread.tags?.[0];
  const hasRedressedAnswer = (thread.redressedAnswerCount ?? 0) > 0;
  const hasAnswers = (thread.answerCount ?? 0) > 0;

  const dominantSentiment = summary.dominantKey
    ? sentimentDefinitions[summary.dominantKey]?.label
    : undefined;

  const status = thread.isScam
    ? 'Scam Claim'
    : hasRedressedAnswer
      ? 'Redressed'
      : undefined;

  return {
    ...thread,
    excerpt,
    author: authorName,
    authorAvatar: thread.creator?.avatarUrl ?? null,
    authorInitial: authorName[0]?.toUpperCase() ?? 'U',
    timeAgo: createdAtLabel,
    badge: thread.isScam ? '⚠️ Scam Claim' : 'Complaint Topic',
    status,
    tag: primaryTag,
    sentiment: dominantSentiment,
    votes: thread.support ?? 0,
    answeredCount: thread.answerCount,
    viewerHasSupported: thread.viewerHasSupported ?? false,
    sentimentBreakdown: summary.metrics,
    totalSentimentVotes: summary.totalVotes,
    dominantSentimentKey: summary.dominantKey,
  };
};

export const getThreadDescription = (thread?: ThreadListItem | null) => {
  if (!thread) return '';
  return truncate(stripHtmlToPlainText(thread.post), 200);
};
