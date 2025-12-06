import { formatTimeAgo } from '@/lib/utils';
import type { RouterOutputs } from '@/types';

import { SentimentKey } from '../../common/sentiment/sentimentConfig';
import { AnswerItem, CommentItem } from '../../common/threadData';
import {
  SENTIMENT_KEYS,
  stripHtmlToPlainText,
  summarizeSentiments,
  type ThreadSentimentRecord,
} from '../../utils/threadTransforms';

type AnswerRecord =
  RouterOutputs['projectDiscussionInteraction']['listAnswers']['items'][0];
type CommentRecord =
  RouterOutputs['projectDiscussionInteraction']['listComments']['items'][0];

type NormalizeAnswerOptions = {
  defaultRole?: string;
  viewerId?: string | null;
  defaultSentiment?: SentimentKey;
};

type NormalizeCommentOptions = {
  defaultRole?: string;
  defaultSentiment?: SentimentKey;
};

export type CommentNode<T extends CommentItem = CommentItem> = T & {
  children?: CommentNode<T>[];
};

const isNormalizedAnswer = (value: any): value is AnswerItem =>
  Boolean(value?.numericId) && typeof value?.createdAt === 'string';

const isNormalizedComment = (value: any): value is CommentItem =>
  Boolean(value?.numericId) && typeof value?.createdAt === 'string';

export const normalizeComment = (
  comment: CommentRecord | CommentItem | (CommentRecord & { comments?: any[] }),
  options: NormalizeCommentOptions = {},
): CommentItem => {
  const { defaultRole = 'Community Member', defaultSentiment = 'recommend' } =
    options;
  if (isNormalizedComment(comment)) {
    return {
      ...comment,
      commentId: comment.commentId ?? comment.numericId,
    };
  }

  const numericId = Number((comment as CommentRecord).id);
  return {
    id: `comment-${comment.id}`,
    numericId,
    answerId: comment.answerId ?? undefined,
    parentCommentId: comment.parentCommentId ?? undefined,
    commentId: comment.commentId ?? numericId,
    author: comment.creator?.name ?? 'Anonymous',
    authorAvatar: comment.creator?.avatarUrl ?? null,
    role: defaultRole,
    createdAt: formatTimeAgo(comment.createdAt),
    body: comment.content,
    sentimentLabel: defaultSentiment,
  };
};

export const normalizeComments = (
  comments:
    | Array<
        CommentRecord | CommentItem | (CommentRecord & { comments?: any[] })
      >
    | undefined
    | null,
  options?: NormalizeCommentOptions,
): CommentItem[] => {
  if (!comments?.length) return [];
  return comments.map((comment) => normalizeComment(comment, options));
};

export const normalizeAnswer = (
  answer: AnswerRecord | AnswerItem,
  options: NormalizeAnswerOptions = {},
): AnswerItem => {
  const {
    defaultRole = 'Community Member',
    viewerId = null,
    defaultSentiment = 'recommend',
  } = options;

  if (isNormalizedAnswer(answer)) {
    const normalizedComments = normalizeComments(answer.comments, {
      defaultRole,
      defaultSentiment,
    });
    return {
      ...answer,
      comments: normalizedComments.length
        ? normalizedComments
        : answer.comments,
      commentsCount:
        answer.commentsCount ??
        normalizedComments.length ??
        answer.comments?.length ??
        0,
      sentimentLabel: answer.sentimentLabel ?? defaultSentiment,
    };
  }

  const sentiment = summarizeSentiments(answer.sentiments);
  const mappedComments = normalizeComments(answer.comments as any, {
    defaultRole,
    defaultSentiment,
  });
  const supportCount =
    (answer as { support?: number }).support ??
    (answer as { voteCount?: number }).voteCount ??
    0;

  return {
    id: `answer-${answer.id}`,
    numericId: answer.id,
    author: answer.creator?.name ?? 'Anonymous',
    authorAvatar: answer.creator?.avatarUrl ?? null,
    role: defaultRole,
    createdAt: formatTimeAgo(answer.createdAt),
    body: answer.content,
    cpSupport: supportCount,
    cpTarget: undefined,
    sentimentLabel: sentiment.dominantKey ?? defaultSentiment,
    sentimentVotes: sentiment.totalVotes,
    commentsCount: mappedComments.length,
    comments: mappedComments,
    viewerSentiment:
      findUserSentiment(answer.sentiments, viewerId) ?? undefined,
    viewerHasSupported: Boolean(
      (answer as { viewerHasSupported?: boolean }).viewerHasSupported,
    ),
  };
};

export const buildCommentTree = <T extends CommentItem>(
  comments: T[],
): CommentNode<T>[] => {
  if (!comments.length) return [];
  const map = new Map<number, CommentNode<T>>();
  const roots: CommentNode<T>[] = [];

  comments.forEach((comment) => {
    const rootId = comment.commentId ?? comment.numericId;
    map.set(comment.numericId, {
      ...comment,
      commentId: rootId,
      children: [],
    });
  });

  comments.forEach((comment) => {
    const node = map.get(comment.numericId)!;
    const parentId =
      comment.parentCommentId ??
      (comment.commentId !== comment.numericId ? comment.commentId : undefined);

    if (parentId && map.has(parentId)) {
      const parent = map.get(parentId)!;
      node.commentId = parent.commentId ?? parent.numericId;
      parent.children!.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

export const buildSentimentSummary = (
  sentiments?: ThreadSentimentRecord[] | null,
) => {
  if (!sentiments?.length) {
    return { metrics: [], totalVotes: 0 };
  }
  const summary = summarizeSentiments(sentiments);
  return {
    metrics: summary.metrics.map((metric) => ({
      key: metric.key,
      percentage: metric.percentage,
      votes: Math.round((metric.percentage / 100) * (summary.totalVotes || 0)),
    })),
    totalVotes: summary.totalVotes,
  };
};

export const formatExcerpt = (text: string, maxLength = 180) => {
  const normalized = stripHtmlToPlainText(text).replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}…`;
};

export const extractParagraphs = (raw?: string) => {
  if (!raw) return [];
  const text = stripHtmlToPlainText(raw).trim();
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
};

export function findUserSentiment(
  sentiments?: ThreadSentimentRecord[] | null,
  userId?: string | null,
): SentimentKey | null {
  if (!sentiments || !userId) {
    return null;
  }
  const record = sentiments.find((item) => item.creator === userId);
  if (!record?.type) {
    return null;
  }
  const normalized = record.type.toLowerCase() as SentimentKey;
  return SENTIMENT_KEYS.includes(normalized) ? normalized : null;
}
