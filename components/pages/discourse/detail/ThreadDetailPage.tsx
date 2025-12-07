'use client';

import { ChartBarIcon } from '@phosphor-icons/react';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/base';
import { addToast } from '@/components/base/toast';
import { REDRESSED_SUPPORT_THRESHOLD } from '@/constants/discourse';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import { formatTimeAgo } from '@/lib/utils';

import {
  SentimentKey,
  SentimentMetric,
} from '../common/sentiment/sentimentConfig';
import {
  SentimentModal,
  SentimentSummaryPanel,
} from '../common/sentiment/SentimentModal';
import { QuickAction, ThreadDetailRecord } from '../common/threadData';
import { TopbarFilters } from '../common/TopbarFilters';
import { EDITOR_MAX_CHARACTERS } from '../utils/editorValue';
import {
  SENTIMENT_KEYS,
  stripHtmlToPlainText,
} from '../utils/threadTransforms';

import { ContributionVotesCard } from './ContributionVotesCard';
import { EmptyState } from './EmptyState';
import { useAnswerSupport } from './hooks/useAnswerSupport';
import { useDiscussionComposer } from './hooks/useDiscussionComposer';
import { useDiscussionLists } from './hooks/useDiscussionLists';
import PostDetailCard from './PostDetailCard';
import { QuickActionsCard } from './QuickActionsCard';
import { AnswerDetailCard } from './ThreadAnswerCard';
import { ThreadCommentTree } from './ThreadCommentTree';
import type { ComposerContext } from './ThreadComposerModal';
import { ThreadComposerModal } from './ThreadComposerModal';
import { ThreadDetailSkeleton } from './ThreadDetailSkeleton';
import {
  buildSentimentSummary,
  extractParagraphs,
  findUserSentiment,
} from './utils/discussionMappers';

type ThreadDetailPageProps = {
  threadId: string;
};

type CommentTarget = {
  threadId: number;
  answerId?: number;
  parentCommentId?: number;
  commentId?: number;
};

const DEFAULT_PARTICIPATION = {
  supportSteps: [
    'Share evidence or updates that confirm the complaint.',
    'Spend Contribution Points to support actionable answers.',
    'Invite moderators or project owners to respond.',
  ],
  counterSteps: [
    'Publish counter evidence or remediation details.',
    'Outline a new proposal and request CP support.',
    'Notify community members who can verify progress.',
  ],
};

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { label: 'Update Post', helper: 'Add context, links, or clarifications.' },
  { label: 'Answer Complaint', helper: 'Share an actionable resolution path.' },
  { label: 'Post Comment', helper: 'Discuss evidence or ask for details.' },
];

export function ThreadDetailPage({ threadId }: ThreadDetailPageProps) {
  const { user, isAuthenticated, showAuthPrompt } = useAuth();
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<'answers' | 'comments'>('answers');
  const [sortOption, setSortOption] = useState<'top' | 'new'>('top');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [answerSentimentPendingId, setAnswerSentimentPendingId] = useState<
    number | null
  >(null);
  const [activeSentimentModal, setActiveSentimentModal] = useState<{
    title: string;
    excerpt: string;
    sentiments?: SentimentMetric[];
    totalVotes?: number;
  } | null>(null);
  const requireAuth = useCallback(() => {
    if (isAuthenticated) {
      return true;
    }
    showAuthPrompt();
    return false;
  }, [isAuthenticated, showAuthPrompt]);
  // const isAnswerComposer = useMemo(
  //   () => composerVariant === 'answer',
  //   [composerVariant],
  // );

  const numericThreadId = Number(threadId);
  const isValidThreadId = Number.isFinite(numericThreadId);

  const threadQuery = trpc.projectDiscussionThread.getThreadById.useQuery(
    { threadId: numericThreadId },
    { enabled: isValidThreadId },
  );

  const sortByParam = sortOption === 'top' ? 'votes' : 'recent';

  const answersQuery =
    trpc.projectDiscussionInteraction.listAnswers.useInfiniteQuery(
      {
        threadId: numericThreadId,
        limit: 10,
        sortBy: sortByParam,
      },
      {
        enabled: isValidThreadId,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        refetchOnWindowFocus: false,
      },
    );

  const commentsQuery =
    trpc.projectDiscussionInteraction.listComments.useInfiniteQuery(
      {
        threadId: numericThreadId,
        limit: 20,
      },
      {
        enabled: isValidThreadId,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        refetchOnWindowFocus: false,
      },
    );

  const baseThread = threadQuery.data;

  const viewerSentiment = useMemo(
    () => findUserSentiment(baseThread?.sentiments, user?.id ?? null),
    [baseThread?.sentiments, user?.id],
  );

  const createAnswerMutation =
    trpc.projectDiscussionInteraction.createAnswer.useMutation({
      onSuccess: () => {
        addToast({
          title: 'Answer submitted',
          description: 'Your contribution is now visible to the community.',
          color: 'success',
        });
        answersQuery.refetch();
      },
      onError: (error) => {
        addToast({
          title: 'Failed to submit answer',
          description: error.message,
          color: 'danger',
        });
      },
    });

  const createCommentMutation =
    trpc.projectDiscussionInteraction.createComment.useMutation({
      onSuccess: (_, variables) => {
        addToast({
          title: 'Comment posted',
          description: 'Your discussion is now visible to everyone.',
          color: 'success',
        });
        if (variables?.answerId) {
          answersQuery.refetch();
        } else {
          commentsQuery.refetch();
        }
      },
      onError: (error) => {
        addToast({
          title: 'Failed to post comment',
          description: error.message,
          color: 'danger',
        });
      },
    });

  const voteAnswerMutation =
    trpc.projectDiscussionInteraction.voteAnswer.useMutation({
      onSuccess: () => {
        addToast({
          title: 'Supported answer',
          description: 'CP support registered successfully.',
          color: 'success',
        });
        answersQuery.refetch();
      },
      onError: (error) => {
        addToast({
          title: 'Unable to support answer',
          description: error.message,
          color: 'danger',
        });
      },
    });

  const unvoteAnswerMutation =
    trpc.projectDiscussionInteraction.unvoteAnswer.useMutation({
      onSuccess: () => {
        addToast({
          title: 'Support withdrawn',
          description: 'Your CP support was withdrawn.',
          color: 'success',
        });
        answersQuery.refetch();
      },
      onError: (error) => {
        addToast({
          title: 'Unable to withdraw support',
          description: error.message,
          color: 'danger',
        });
      },
    });

  const voteThreadMutation =
    trpc.projectDiscussionThread.voteThread.useMutation({
      onSuccess: () => {
        addToast({
          title: 'Supported thread',
          description: 'CP support registered for this thread.',
          color: 'success',
        });
        threadQuery.refetch();
        utils.projectDiscussionThread.listThreads.invalidate();
      },
      onError: (error) => {
        addToast({
          title: 'Unable to support thread',
          description: error.message,
          color: 'danger',
        });
      },
    });

  const unvoteThreadMutation =
    trpc.projectDiscussionThread.unvoteThread.useMutation({
      onSuccess: () => {
        addToast({
          title: 'Support withdrawn',
          description: 'Your CP support was withdrawn.',
          color: 'success',
        });
        threadQuery.refetch();
        utils.projectDiscussionThread.listThreads.invalidate();
      },
      onError: (error) => {
        addToast({
          title: 'Unable to withdraw support',
          description: error.message,
          color: 'danger',
        });
      },
    });

  const viewerHasSupportedThread = useMemo(
    () =>
      Boolean(
        (baseThread as { viewerHasSupported?: boolean } | undefined)
          ?.viewerHasSupported,
      ),
    [baseThread],
  );

  const threadSupportPending = voteThreadMutation.isPending;
  const threadWithdrawPending = unvoteThreadMutation.isPending;

  const hasSupportedThread = useMemo(() => {
    if (voteThreadMutation.isPending || voteThreadMutation.isSuccess) {
      return true;
    }
    if (unvoteThreadMutation.isPending || unvoteThreadMutation.isSuccess) {
      return false;
    }
    return viewerHasSupportedThread;
  }, [
    unvoteThreadMutation.isPending,
    unvoteThreadMutation.isSuccess,
    viewerHasSupportedThread,
    voteThreadMutation.isPending,
    voteThreadMutation.isSuccess,
  ]);

  const setThreadSentimentMutation =
    trpc.projectDiscussionInteraction.setSentiment.useMutation({
      onSuccess: () => {
        addToast({
          title: 'Sentiment recorded',
          description: 'Your view has been captured for this thread.',
          color: 'success',
        });
        threadQuery.refetch();
        utils.projectDiscussionThread.listThreads.invalidate();
      },
      onError: (error) => {
        addToast({
          title: 'Unable to submit sentiment',
          description: error.message,
          color: 'danger',
        });
      },
    });

  const setAnswerSentimentMutation =
    trpc.projectDiscussionInteraction.setSentiment.useMutation({
      onSuccess: () => {
        addToast({
          title: 'Sentiment recorded',
          description: 'Your view has been captured for this answer.',
          color: 'success',
        });
        answersQuery.refetch();
      },
      onError: (error) => {
        addToast({
          title: 'Unable to submit sentiment',
          description: error.message,
          color: 'danger',
        });
      },
    });

  const {
    composerVariant,
    modalVariant,
    isPrimaryComposer: isAnswerComposer,
    primaryDraft: answerDraft,
    commentDraft,
    primaryError: answerError,
    commentError,
    commentComposerTitle,
    commentContext,
    openPrimaryComposer: openAnswerComposer,
    openCommentComposer,
    closeComposer: handleCloseComposer,
    handleSubmitPrimary: handleSubmitAnswer,
    handleSubmitComment,
    setPrimaryDraft: setAnswerDraft,
    setCommentDraft,
  } = useDiscussionComposer({
    primaryVariant: 'answer',
    threadId: numericThreadId,
    maxCharacters: EDITOR_MAX_CHARACTERS,
    requireAuth,
    defaultCommentTarget: { threadId: numericThreadId },
    messages: {
      primary: {
        required: 'Answer content is required',
        exceed: 'Answer exceeds the character limit',
        failed: 'Failed to submit answer',
      },
      comment: {
        required: 'Comment content is required',
        exceed: 'Comment exceeds the character limit',
        failed: 'Failed to post comment',
      },
    },
    primarySubmit: async ({ html }) => {
      if (!isValidThreadId) return;
      await createAnswerMutation.mutateAsync({
        threadId: numericThreadId,
        content: html,
      });
    },
    commentSubmit: async ({ html, target }) => {
      if (!isValidThreadId) return;
      await createCommentMutation.mutateAsync({
        threadId: target.threadId,
        answerId: target.answerId,
        parentCommentId: target.parentCommentId,
        content: html,
      });
    },
    primarySubmitting: createAnswerMutation.isPending,
    commentSubmitting: createCommentMutation.isPending,
  });

  type CommentComposerContext = ComposerContext | null | undefined;

  const handleSupportThread = async () => {
    if (!isValidThreadId || !requireAuth()) {
      return;
    }
    try {
      await voteThreadMutation.mutateAsync({ threadId: numericThreadId });
    } catch {
      // handled via mutation callbacks
    }
  };

  const handleWithdrawThread = async () => {
    if (!isValidThreadId || !requireAuth()) {
      return;
    }
    try {
      await unvoteThreadMutation.mutateAsync({ threadId: numericThreadId });
    } catch {
      // handled via mutation callbacks
    }
  };

  const handleSetThreadSentiment = async (sentiment: SentimentKey) => {
    if (!isValidThreadId || !requireAuth()) {
      return;
    }
    await setThreadSentimentMutation.mutateAsync({
      threadId: numericThreadId,
      type: sentiment,
    });
  };

  const handleSetAnswerSentiment = async (
    answerId: number,
    sentiment: SentimentKey,
  ) => {
    if (!isValidThreadId || !requireAuth()) {
      return;
    }
    setAnswerSentimentPendingId(answerId);
    try {
      await setAnswerSentimentMutation.mutateAsync({
        answerId,
        type: sentiment,
      });
    } finally {
      setAnswerSentimentPendingId(null);
    }
  };

  const {
    answers: answersFromApi,
    threadComments,
    filteredAnswers,
    filteredComments,
    isAnswersInitialLoading,
    isCommentsInitialLoading,
  } = useDiscussionLists({
    answersQuery,
    commentsQuery,
    viewerId: user?.id ?? null,
    sentimentFilter: sentimentFilter as 'all' | SentimentKey,
    buildThreadTree: true,
  });

  const {
    handleSupport: handleSupportAnswer,
    handleWithdraw: handleWithdrawSupport,
    supportingId: supportingAnswerId,
    withdrawingId: withdrawingAnswerId,
  } = useAnswerSupport({
    requireAuth,
    answers: answersFromApi,
    voteAnswer: (answerId) => voteAnswerMutation.mutateAsync({ answerId }),
    unvoteAnswer: (answerId) => unvoteAnswerMutation.mutateAsync({ answerId }),
  });

  const sentimentSummary = useMemo(
    () => buildSentimentSummary(baseThread?.sentiments),
    [baseThread?.sentiments],
  );

  const thread = useMemo<ThreadDetailRecord | null>(() => {
    if (!baseThread) {
      return null;
    }
    const paragraphs = extractParagraphs(baseThread.post);
    const cpTarget = REDRESSED_SUPPORT_THRESHOLD;
    const cpCurrent = answersFromApi.reduce(
      (max, answer) => Math.max(max, answer.cpSupport),
      0,
    );
    const answerTotalCount = Math.max(
      baseThread.answerCount ?? 0,
      answersFromApi.length,
    );
    const threadCommentCount = threadComments.length;
    const hasRedressedAnswer = (baseThread.redressedAnswerCount ?? 0) > 0;
    const status = hasRedressedAnswer
      ? 'Redressed'
      : answerTotalCount === 0
        ? 'Unanswered'
        : 'Open';

    const baseRecord: ThreadDetailRecord = {
      id: String(baseThread.id),
      title: baseThread.title,
      summary: stripHtmlToPlainText(baseThread.post),
      badge: 'Complaint Topic',
      status,
      isScam: false,
      post: baseThread.post,
      categories: baseThread.category ?? [],
      tags: baseThread.tags ?? [],
      highlights: [
        { label: 'Answers', value: `${answerTotalCount}` },
        { label: 'Comments', value: `${threadCommentCount}` },
        { label: 'Views', value: '—' },
      ],
      body: paragraphs.length
        ? paragraphs
        : [stripHtmlToPlainText(baseThread.post)],
      cpProgress: {
        current: cpCurrent,
        target: cpTarget,
        label: 'Contribution Points supporting the leading answer',
        helper:
          'Reaching the threshold signals community confidence in this answer.',
      },
      sentiment: sentimentSummary.metrics,
      totalSentimentVotes: sentimentSummary.totalVotes,
      answers: answersFromApi,
      comments: threadComments,
      author: {
        name: baseThread.creator?.name ?? 'Anonymous',
        handle: baseThread.creator?.userId
          ? `@${baseThread.creator.userId.slice(0, 8)}`
          : '@anonymous',
        avatarFallback: baseThread.creator?.name?.[0]?.toUpperCase() ?? 'U',
        avatarUrl: baseThread.creator?.avatarUrl ?? null,
        role: 'Community Member',
        postedAt: formatTimeAgo(baseThread.createdAt),
        editedAt: undefined,
      },
      participation: DEFAULT_PARTICIPATION,
      quickActions: DEFAULT_QUICK_ACTIONS,
      canRetract: false,
    };

    return baseRecord;
  }, [
    answersFromApi,
    baseThread,
    sentimentSummary.metrics,
    sentimentSummary.totalVotes,
    threadComments,
  ]);

  const handleOpenAnswerComposer = useCallback(
    () => openAnswerComposer(),
    [openAnswerComposer],
  );

  const handleOpenThreadComment = useCallback(
    () =>
      openCommentComposer({
        target: { threadId: numericThreadId },
      }),
    [numericThreadId, openCommentComposer],
  );

  const handleStatusChange = useCallback(
    (value: string) =>
      setActiveTab(value === 'comments' ? 'comments' : 'answers'),
    [],
  );

  const handleSortChange = useCallback(
    (value: string) => setSortOption(value === 'new' ? 'new' : 'top'),
    [],
  );

  const handleSentimentChange = useCallback(
    (value: string) => setSentimentFilter(value),
    [],
  );

  const handleShowAnswerSentimentDetail = useCallback(
    (payload: {
      title: string;
      excerpt: string;
      sentiments?: SentimentMetric[];
      totalVotes?: number;
    }) => setActiveSentimentModal(payload),
    [],
  );

  const makeOnPostComment = useCallback(
    (answerId: number) => (context?: CommentComposerContext) =>
      openCommentComposer({
        title: context?.title ?? 'Post Comment',
        context: context ?? null,
        target:
          context?.target ??
          ({
            threadId: numericThreadId,
            answerId,
            commentId: undefined,
          } as CommentTarget),
      }),
    [numericThreadId, openCommentComposer],
  );

  const handleReplyToComment = useCallback(
    (payload: {
      parentCommentId?: number;
      commentId?: number;
      author?: string;
      isOp?: boolean;
      timestamp?: string;
      excerpt?: string;
    }) =>
      openCommentComposer({
        title: 'Post Reply',
        context: {
          title: 'Replying to:',
          author: payload.author ?? '',
          isOp: payload.isOp,
          timestamp: payload.timestamp,
          excerpt: payload.excerpt ?? '',
          target: {
            threadId: numericThreadId,
            parentCommentId: payload.parentCommentId,
            commentId: payload.commentId,
          },
        },
        target: {
          threadId: numericThreadId,
          parentCommentId: payload.parentCommentId,
          commentId: payload.commentId,
        },
      }),
    [numericThreadId, openCommentComposer],
  );

  const handleLoadMoreAnswers = useCallback(
    () => answersQuery.fetchNextPage(),
    [answersQuery],
  );

  const handleLoadMoreComments = useCallback(
    () => commentsQuery.fetchNextPage(),
    [commentsQuery],
  );

  if (!isValidThreadId) {
    return (
      <div className="p-10 text-center text-sm text-black/60">
        Invalid thread identifier.
      </div>
    );
  }

  if (threadQuery.isLoading) {
    return <ThreadDetailSkeleton />;
  }

  if (!thread) {
    return (
      <div className="p-10 text-center text-sm text-black/60">
        Thread not found.
      </div>
    );
  }

  const threadContentHtml =
    baseThread?.post ??
    thread.body.map((paragraph) => `<p>${paragraph}</p>`).join('');

  const answersToRender = thread.answers;
  const totalAnswerCount = Math.max(
    baseThread?.answerCount ?? 0,
    answersToRender.length ?? 0,
  );
  const totalCommentCount = threadComments.length;

  const tabOptions = [
    {
      key: 'answers',
      label: 'Answers',
      count: totalAnswerCount,
    },
    { key: 'comments', label: 'Discuss', count: totalCommentCount },
  ];

  const isAnswersTab = activeTab === 'answers';
  const answerEmptyState = {
    title: 'No answers yet',
    description: 'Be the first to propose accountable steps for resolution.',
  };
  const discussionEmptyState = {
    title: 'No discussion yet',
    description:
      'Ask clarifying questions or share context to help the community respond.',
  };
  return (
    <>
      <div className="flex items-start justify-center gap-[40px] pt-[20px]">
        <section className="w-[700px] space-y-6">
          <PostDetailCard
            title={thread.title}
            author={thread.author.name}
            authorAvatar={thread.author.avatarUrl}
            timeAgo={thread.author.postedAt}
            contentHtml={threadContentHtml}
            tags={thread.tags}
            categoryLabel={thread.categories[0] ?? 'General'}
            supportCount={baseThread?.support ?? 0}
            hasSupported={hasSupportedThread}
            supportPending={threadSupportPending}
            withdrawPending={threadWithdrawPending}
            sentimentVotes={thread.totalSentimentVotes}
            viewerSentiment={viewerSentiment}
            sentimentPending={setThreadSentimentMutation.isPending}
            onSelectSentiment={handleSetThreadSentiment}
            requireAuth={requireAuth}
            onSupportThread={handleSupportThread}
            onWithdrawThread={handleWithdrawThread}
            onAnswer={handleOpenAnswerComposer}
            onComment={handleOpenThreadComment}
          />

          <div className="pb-[40px]">
            <TopbarFilters
              statusTabs={tabOptions.map((tab) => tab.key)}
              activeStatus={activeTab}
              onStatusChange={handleStatusChange}
              sortOptions={['top', 'new']}
              activeSort={sortOption}
              onSortChange={handleSortChange}
              sentimentOptions={SENTIMENT_KEYS}
              selectedSentiment={sentimentFilter}
              onSentimentChange={handleSentimentChange}
              renderStatusLabel={(value) => {
                const tab = tabOptions.find((item) => item.key === value);
                if (!tab) return value;
                return (
                  <span className="flex items-center gap-2">
                    <span>{tab.label}</span>
                    <span className="rounded-md bg-black/10 px-1 text-[12px] font-semibold text-black/60">
                      {tab.count}
                    </span>
                  </span>
                );
              }}
            />
            <div className="space-y-4 pt-5">
              {isAnswersTab ? (
                <>
                  {isAnswersInitialLoading ? (
                    <div className="rounded-[12px] border border-dashed border-black/15 bg-white/80 px-4 py-6 text-center text-sm text-black/60">
                      Loading answers…
                    </div>
                  ) : null}
                  {filteredAnswers.length
                    ? filteredAnswers.map((answer) => (
                        <AnswerDetailCard
                          key={answer.id}
                          answer={answer}
                          threadId={numericThreadId}
                          onSupport={handleSupportAnswer}
                          onWithdraw={handleWithdrawSupport}
                          onSelectSentiment={handleSetAnswerSentiment}
                          onShowSentimentDetail={
                            handleShowAnswerSentimentDetail
                          }
                          onPostComment={makeOnPostComment(answer.numericId)}
                          threadAuthorName={thread.author.name}
                          supportPending={
                            supportingAnswerId === answer.numericId
                          }
                          withdrawPending={
                            withdrawingAnswerId === answer.numericId
                          }
                          sentimentPendingId={answerSentimentPendingId}
                        />
                      ))
                    : !isAnswersInitialLoading && (
                        <EmptyState
                          title={answerEmptyState.title}
                          description={answerEmptyState.description}
                        />
                      )}
                  {answersQuery.hasNextPage ? (
                    <div className="flex justify-center">
                      <Button
                        className="rounded-full border border-black/10 px-6 py-2 text-sm font-semibold text-black"
                        onPress={handleLoadMoreAnswers}
                        isLoading={answersQuery.isFetchingNextPage}
                      >
                        Load more answers
                      </Button>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <div className="">
                    <Button
                      className="w-full rounded-[5px] p-[10px] text-[13px] font-semibold text-black/80"
                      onPress={handleOpenThreadComment}
                    >
                      Post Comment
                    </Button>
                  </div>
                  {isCommentsInitialLoading ? (
                    <div className="rounded-[12px] border border-dashed border-black/15 bg-white/80 px-4 py-6 text-center text-sm text-black/60">
                      Loading discussion…
                    </div>
                  ) : null}
                  {filteredComments.length
                    ? filteredComments.map((comment, index) => (
                        <ThreadCommentTree
                          key={comment.id}
                          node={comment}
                          depth={0}
                          isFirst={index === 0}
                          hasSiblings={filteredComments.length > 1}
                          onReply={handleReplyToComment}
                          threadAuthorName={thread.author.name}
                          threadId={numericThreadId}
                        />
                      ))
                    : !isCommentsInitialLoading && (
                        <EmptyState
                          title={discussionEmptyState.title}
                          description={discussionEmptyState.description}
                        />
                      )}
                  {commentsQuery.hasNextPage ? (
                    <div className="flex justify-center">
                      <Button
                        className="rounded-full border border-black/10 px-6 py-2 text-sm font-semibold text-black"
                        onPress={handleLoadMoreComments}
                        isLoading={commentsQuery.isFetchingNextPage}
                      >
                        Load more comments
                      </Button>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </section>

        <div className="w-[300px] space-y-[20px]">
          <ContributionVotesCard
            current={thread.cpProgress.current}
            target={thread.cpProgress.target}
            label={thread.cpProgress.label}
            helper={thread.cpProgress.helper}
            status={thread.status}
            isScam={false}
          />

          <SentimentSummaryPanel
            sentiments={thread.sentiment.map((item) => ({
              key: item.key,
              percentage: item.percentage,
            }))}
            totalVotes={thread.totalSentimentVotes}
            customHeader={
              <div className="flex items-center gap-[10px]">
                <ChartBarIcon size={20} weight="fill" />
                <span className="text-[14px] font-[600]">
                  User sentiment for this post
                </span>
              </div>
            }
          />

          <QuickActionsCard actions={thread.quickActions} />
        </div>
      </div>

      {composerVariant ? (
        <ThreadComposerModal
          variant={modalVariant}
          isOpen
          value={isAnswerComposer ? answerDraft : commentDraft}
          onChange={(value) =>
            isAnswerComposer ? setAnswerDraft(value) : setCommentDraft(value)
          }
          onSubmit={isAnswerComposer ? handleSubmitAnswer : handleSubmitComment}
          onClose={handleCloseComposer}
          isSubmitting={
            isAnswerComposer
              ? createAnswerMutation.isPending
              : createCommentMutation.isPending
          }
          error={isAnswerComposer ? answerError : commentError}
          threadTitle={thread.title}
          threadCategory={thread.categories[0] ?? undefined}
          contextCard={
            !isAnswerComposer ? (commentContext ?? undefined) : undefined
          }
          titleOverride={!isAnswerComposer ? commentComposerTitle : undefined}
        />
      ) : null}

      <SentimentModal
        open={Boolean(activeSentimentModal)}
        onClose={() => setActiveSentimentModal(null)}
        title={activeSentimentModal?.title ?? ''}
        excerpt={activeSentimentModal?.excerpt ?? ''}
        sentiments={activeSentimentModal?.sentiments}
        totalVotes={activeSentimentModal?.totalVotes}
      />
    </>
  );
}

export { SentimentSummaryPanel };
