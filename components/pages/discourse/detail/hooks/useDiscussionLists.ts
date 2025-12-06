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

type InfiniteQuery<T> = {
  data?: {
    pages?: { items: T[]; nextCursor?: unknown }[];
  };
  isLoading?: boolean;
};

type DiscussionListsOptions<A, C> = {
  answersQuery?: InfiniteQuery<A>;
  commentsQuery?: InfiniteQuery<C>;
  fallbackAnswers?: A[];
  fallbackComments?: C[];
  viewerId?: string | null;
  defaultRole?: string;
  sentimentFilter?: 'all' | SentimentKey;
  buildThreadTree?: boolean;
};

export const useDiscussionLists = <A, C>({
  answersQuery,
  commentsQuery,
  fallbackAnswers = [],
  fallbackComments = [],
  viewerId,
  defaultRole = 'Community Member',
  sentimentFilter = 'all',
  buildThreadTree = false,
}: DiscussionListsOptions<A, C>) => {
  const answers = useMemo<AnswerItem[]>(() => {
    const remoteItems = answersQuery?.data?.pages?.length
      ? answersQuery.data.pages.flatMap((page) => page.items)
      : [];
    const sourceItems =
      remoteItems && remoteItems.length > 0 ? remoteItems : fallbackAnswers;
    if (!sourceItems.length) return [];

    return sourceItems.map((answer) =>
      normalizeAnswer(answer as any, {
        defaultRole,
        viewerId,
      }),
    );
  }, [answersQuery?.data, defaultRole, fallbackAnswers, viewerId]);

  const comments = useMemo<CommentItem[]>(() => {
    const remoteItems = commentsQuery?.data?.pages?.length
      ? commentsQuery.data.pages.flatMap((page) => page.items)
      : [];
    const sourceItems =
      remoteItems && remoteItems.length > 0 ? remoteItems : fallbackComments;
    if (!sourceItems.length) return [];

    return sourceItems.map((comment) =>
      normalizeComment(comment as any, { defaultRole }),
    );
  }, [commentsQuery?.data, defaultRole, fallbackComments]);

  const discussionTree = useMemo<CommentNode<CommentItem>[] | undefined>(() => {
    if (!buildThreadTree) return undefined;
    const threadComments = comments.filter((comment) => !comment.answerId);
    return buildCommentTree(threadComments);
  }, [buildThreadTree, comments]);

  const filteredAnswers = useMemo(() => {
    if (sentimentFilter === 'all') return answers;
    return answers.filter(
      (answer) => answer.sentimentLabel === sentimentFilter,
    );
  }, [answers, sentimentFilter]);

  const filteredComments = useMemo(() => {
    const baseComments = buildThreadTree
      ? (discussionTree ?? [])
      : (comments as CommentNode<CommentItem>[]);
    if (sentimentFilter === 'all') return baseComments;
    return baseComments.filter(
      (comment) => comment.sentimentLabel === sentimentFilter,
    );
  }, [buildThreadTree, comments, discussionTree, sentimentFilter]);

  const isAnswersInitialLoading =
    Boolean(answersQuery?.isLoading) && !answers.length;
  const isCommentsInitialLoading =
    Boolean(commentsQuery?.isLoading) && !comments.length;

  return {
    answers,
    comments,
    discussionTree,
    filteredAnswers,
    filteredComments,
    isAnswersInitialLoading,
    isCommentsInitialLoading,
  };
};
