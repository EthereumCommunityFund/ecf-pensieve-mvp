import { useMemo } from 'react';

import type { SentimentKey } from '@/components/pages/discourse/common/sentiment/sentimentConfig';
import type {
  AnswerItem,
  CommentItem,
} from '@/components/pages/discourse/common/threadData';
import {
  buildCommentTree,
  CommentNode,
  normalizeAnswer,
  normalizeComment,
} from '@/components/pages/discourse/detail/utils/discussionMappers';
import { REDRESSED_SUPPORT_THRESHOLD } from '@/constants/discourse';

type InfiniteQuery<T> = {
  data?: {
    pages?: { items: T[]; nextCursor?: unknown }[];
  };
  isLoading?: boolean;
};

type DiscussionListsOptions<A, C> = {
  answersQuery?: InfiniteQuery<A>;
  commentsQuery?: InfiniteQuery<C>;
  viewerId?: string | null;
  defaultRole?: string;
  sentimentFilter?: 'all' | SentimentKey;
  buildThreadTree?: boolean;
  cpTarget?: number;
};

export const useDiscussionLists = <A, C>({
  answersQuery,
  commentsQuery,
  viewerId,
  defaultRole = 'Community Member',
  sentimentFilter = 'all',
  buildThreadTree = false,
  cpTarget = REDRESSED_SUPPORT_THRESHOLD,
}: DiscussionListsOptions<A, C>) => {
  const flattenComments = (items: any[]): any[] => {
    if (!items?.length) return [];
    const result: any[] = [];
    const walk = (node: any) => {
      if (!node) return;
      result.push(node);
      const children =
        node.childrenComments ??
        node.replies ??
        node.comments ??
        node.children ??
        [];
      if (Array.isArray(children)) {
        children.forEach(walk);
      }
    };
    items.forEach(walk);
    return result;
  };

  const answers = useMemo<AnswerItem[]>(() => {
    const remoteItems = answersQuery?.data?.pages?.length
      ? answersQuery.data.pages.flatMap((page) => page.items)
      : [];
    if (!remoteItems.length) return [];

    return remoteItems.map((answer) =>
      normalizeAnswer(answer as any, {
        defaultRole,
        viewerId,
        cpTarget,
      }),
    );
  }, [answersQuery?.data, cpTarget, defaultRole, viewerId]);

  const comments = useMemo<CommentItem[]>(() => {
    const remoteItems = commentsQuery?.data?.pages?.length
      ? commentsQuery.data.pages.flatMap((page) => page.items)
      : [];
    if (!remoteItems.length) return [];

    const flattened = flattenComments(remoteItems);
    const normalized = flattened.map((comment) =>
      normalizeComment(comment as any, { defaultRole }),
    );

    const seen = new Set<number>();
    const unique: CommentItem[] = [];
    for (const item of normalized) {
      if (seen.has(item.numericId)) continue;
      seen.add(item.numericId);
      unique.push(item);
    }

    return unique;
  }, [commentsQuery?.data, defaultRole]);

  const threadComments = useMemo(
    () => comments.filter((comment) => !comment.answerId),
    [comments],
  );

  const answerComments = useMemo(
    () => comments.filter((comment) => Boolean(comment.answerId)),
    [comments],
  );

  const discussionTree = useMemo<CommentNode<CommentItem>[] | undefined>(() => {
    if (!buildThreadTree) return undefined;
    return buildCommentTree(threadComments);
  }, [buildThreadTree, threadComments]);

  const filteredAnswers = useMemo(() => {
    if (sentimentFilter === 'all') return answers;
    return answers.filter(
      (answer) => answer.sentimentLabel === sentimentFilter,
    );
  }, [answers, sentimentFilter]);

  const filteredComments = useMemo(() => {
    const baseComments = buildThreadTree
      ? (discussionTree ?? [])
      : (threadComments as CommentNode<CommentItem>[]);
    return baseComments;
  }, [buildThreadTree, discussionTree, threadComments]);

  const isAnswersInitialLoading =
    Boolean(answersQuery?.isLoading) && !answers.length;
  const isCommentsInitialLoading =
    Boolean(commentsQuery?.isLoading) && !comments.length;

  return {
    answers,
    comments,
    threadComments,
    answerComments,
    discussionTree,
    filteredAnswers,
    filteredComments,
    isAnswersInitialLoading,
    isCommentsInitialLoading,
  };
};
