'use client';

import { ChartBarIcon } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/base';
import { addToast } from '@/components/base/toast';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import { formatTimeAgo } from '@/lib/utils';

import { SentimentKey } from '../common/sentiment/sentimentConfig';
import { SentimentSummaryPanel } from '../common/sentiment/SentimentModal';
import { QuickAction, ThreadDetailRecord } from '../common/threadData';
import { TopbarFilters } from '../common/TopbarFilters';
import { REDRESSED_SUPPORT_THRESHOLD } from '../utils/constants';
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
import { ThreadComposerModal } from './ThreadComposerModal';
import { ThreadDetailSkeleton } from './ThreadDetailSkeleton';
import {
  buildSentimentSummary,
  extractParagraphs,
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
  const [threadSupportPending, setThreadSupportPending] = useState(false);
  const [threadWithdrawPending, setThreadWithdrawPending] = useState(false);
  const [hasSupportedThread, setHasSupportedThread] = useState(false);
  const requireAuth = () => {
    if (isAuthenticated) {
      return true;
    }
    showAuthPrompt();
    return false;
  };
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

  useEffect(() => {
    if (!baseThread) return;
    const viewerHasSupported =
      (baseThread as { viewerHasSupported?: boolean }).viewerHasSupported ??
      false;
    setHasSupportedThread(viewerHasSupported);
  }, [baseThread]);

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

  const handleSupportThread = async () => {
    if (!isValidThreadId || !requireAuth()) {
      return;
    }
    setThreadSupportPending(true);
    try {
      await voteThreadMutation.mutateAsync({ threadId: numericThreadId });
      setHasSupportedThread(true);
    } catch {
      // handled via mutation callbacks
    } finally {
      setThreadSupportPending(false);
    }
  };

  const handleWithdrawThread = async () => {
    if (!isValidThreadId || !requireAuth()) {
      return;
    }
    setThreadWithdrawPending(true);
    try {
      await unvoteThreadMutation.mutateAsync({ threadId: numericThreadId });
      setHasSupportedThread(false);
    } catch {
      // handled via mutation callbacks
    } finally {
      setThreadWithdrawPending(false);
    }
  };

  const {
    answers: answersFromApi,
    comments: commentsFromApi,
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
    const answerTotalCount = baseThread.answerCount ?? answersFromApi.length;
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
      categories: baseThread.category ?? [],
      tags: baseThread.tags ?? [],
      highlights: [
        { label: 'Answers', value: `${answerTotalCount}` },
        { label: 'Comments', value: `${commentsFromApi.length}` },
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
      comments: commentsFromApi,
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
    commentsFromApi,
    sentimentSummary.metrics,
    sentimentSummary.totalVotes,
  ]);

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
  const totalAnswerCount =
    baseThread?.answerCount ?? answersToRender.length ?? 0;
  const totalCommentCount = thread.comments.length;

  const tabOptions = [
    {
      key: 'answers',
      label: 'Answers',
      count: totalAnswerCount,
    },
    { key: 'comments', label: 'Discuss', count: totalCommentCount },
  ];

  // const filteredAnswers =
  //   sentimentFilter === 'all'
  //     ? answersToRender
  //     : answersToRender.filter(
  //         (answer) => answer.sentimentLabel === sentimentFilter,
  //       );

  // const filteredComments: ThreadCommentNode[] =
  //   sentimentFilter === 'all'
  //     ? discussionTree
  //     : discussionTree.filter(
  //         (comment) => comment.sentimentLabel === sentimentFilter,
  //       );

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
            onSupportThread={handleSupportThread}
            onWithdrawThread={handleWithdrawThread}
            onAnswer={() => openAnswerComposer()}
            onComment={() =>
              openCommentComposer({
                target: { threadId: numericThreadId },
              })
            }
          />

          <div className="pb-[40px]">
            <TopbarFilters
              statusTabs={tabOptions.map((tab) => tab.key)}
              activeStatus={activeTab}
              onStatusChange={(value) =>
                setActiveTab(value === 'comments' ? 'comments' : 'answers')
              }
              sortOptions={['top', 'new']}
              activeSort={sortOption}
              onSortChange={(value) =>
                setSortOption(value === 'new' ? 'new' : 'top')
              }
              sentimentOptions={SENTIMENT_KEYS}
              selectedSentiment={sentimentFilter}
              onSentimentChange={(value) => setSentimentFilter(value)}
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
                          onPostComment={(context) =>
                            openCommentComposer({
                              title: context?.title ?? 'Post Comment',
                              context,
                              target:
                                context?.target ??
                                ({
                                  threadId: numericThreadId,
                                  answerId: answer.numericId,
                                  commentId: undefined,
                                } as CommentTarget),
                            })
                          }
                          threadAuthorName={thread.author.name}
                          supportPending={
                            supportingAnswerId === answer.numericId
                          }
                          withdrawPending={
                            withdrawingAnswerId === answer.numericId
                          }
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
                        onPress={() => answersQuery.fetchNextPage()}
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
                      onPress={() =>
                        openCommentComposer({
                          target: { threadId: numericThreadId },
                        })
                      }
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
                          onReply={(payload) =>
                            openCommentComposer({
                              title: 'Post Reply',
                              context: {
                                title: 'Replying to:',
                                author: payload.author,
                                isOp: payload.isOp,
                                timestamp: payload.timestamp,
                                excerpt: payload.excerpt,
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
                            })
                          }
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
                        onPress={() => commentsQuery.fetchNextPage()}
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
    </>
  );
}

export { SentimentSummaryPanel };
