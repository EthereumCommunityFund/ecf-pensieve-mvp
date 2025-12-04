'use client';

import { ChartBarIcon } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/base';
import { addToast } from '@/components/base/toast';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import { formatTimeAgo } from '@/lib/utils';

import {
  SentimentKey,
  SentimentMetric,
} from '../common/sentiment/sentimentConfig';
import { SentimentSummaryPanel } from '../common/sentiment/SentimentModal';
import {
  AnswerItem,
  CommentItem,
  QuickAction,
  ThreadDetailRecord,
} from '../common/threadData';
import { TopbarFilters } from '../common/TopbarFilters';
import {
  SENTIMENT_KEYS,
  stripHtmlToPlainText,
  summarizeSentiments,
  type ThreadSentimentRecord,
} from '../utils/threadTransforms';

import { AnswerCard } from './AnswerCard';
import { CommentCard } from './CommentCard';
import { ComposerCard } from './ComposerCard';
import { ContributionVotesCard } from './ContributionVotesCard';
import { EmptyState } from './EmptyState';
import { mockThreadAnswers, mockThreadComments } from './mockDiscussionData';
import PostDetailCard from './PostDetailCard';
import { QuickActionsCard } from './QuickActionsCard';

type ThreadDetailPageProps = {
  threadId: string;
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
  const router = useRouter();
  const { user, isAuthenticated, showAuthPrompt } = useAuth();
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<'answers' | 'comments'>('answers');
  const [sortOption, setSortOption] = useState<'top' | 'new'>('top');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [showAnswerComposer, setShowAnswerComposer] = useState(false);
  const [showCommentComposer, setShowCommentComposer] = useState(false);
  const [threadSentimentSelection, setThreadSentimentSelection] =
    useState<SentimentKey | null>(null);
  const [answerDraft, setAnswerDraft] = useState('');
  const [commentDraft, setCommentDraft] = useState('');
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [supportingAnswerId, setSupportingAnswerId] = useState<number | null>(
    null,
  );
  const [withdrawingAnswerId, setWithdrawingAnswerId] = useState<number | null>(
    null,
  );
  const requireAuth = () => {
    if (isAuthenticated) {
      return true;
    }
    showAuthPrompt();
    return false;
  };

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

  const fallbackAnswerRecords = useMemo(
    () => mockThreadAnswers[threadId] ?? mockThreadAnswers.default ?? [],
    [threadId],
  );

  const fallbackCommentRecords = useMemo(
    () => mockThreadComments[threadId] ?? mockThreadComments.default ?? [],
    [threadId],
  );

  const baseThread = threadQuery.data;

  const createAnswerMutation =
    trpc.projectDiscussionInteraction.createAnswer.useMutation({
      onSuccess: () => {
        addToast({
          title: 'Answer submitted',
          description: 'Your contribution is now visible to the community.',
          color: 'success',
        });
        setAnswerDraft('');
        setAnswerError(null);
        setShowAnswerComposer(false);
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
      onSuccess: () => {
        addToast({
          title: 'Comment posted',
          description: 'Your discussion is now visible to everyone.',
          color: 'success',
        });
        setCommentDraft('');
        setCommentError(null);
        setShowCommentComposer(false);
        commentsQuery.refetch();
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

  const setSentimentMutation =
    trpc.projectDiscussionInteraction.setSentiment.useMutation({
      onSuccess: () => {
        threadQuery.refetch();
        answersQuery.refetch();
      },
      onError: (error) => {
        addToast({
          title: 'Unable to update sentiment',
          description: error.message,
          color: 'danger',
        });
      },
    });

  const viewerThreadSentiment = useMemo(
    () => findUserSentiment(baseThread?.sentiments, user?.id),
    [baseThread?.sentiments, user?.id],
  );

  useEffect(() => {
    setThreadSentimentSelection(viewerThreadSentiment ?? null);
  }, [viewerThreadSentiment]);

  const handleSubmitAnswer = async () => {
    if (!isValidThreadId || !requireAuth()) {
      return;
    }
    const trimmed = answerDraft.trim();
    if (!trimmed) {
      setAnswerError('Answer content is required');
      return;
    }
    setAnswerError(null);
    try {
      await createAnswerMutation.mutateAsync({
        threadId: numericThreadId,
        content: trimmed,
      });
    } catch (error: any) {
      setAnswerError(error.message ?? 'Failed to submit answer');
    }
  };

  const handleSubmitComment = async () => {
    if (!isValidThreadId || !requireAuth()) {
      return;
    }
    const trimmed = commentDraft.trim();
    if (!trimmed) {
      setCommentError('Comment content is required');
      return;
    }
    setCommentError(null);
    try {
      await createCommentMutation.mutateAsync({
        threadId: numericThreadId,
        content: trimmed,
      });
    } catch (error: any) {
      setCommentError(error.message ?? 'Failed to post comment');
    }
  };

  const handleSupportAnswer = async (answerId: number) => {
    if (!requireAuth()) {
      return;
    }
    setSupportingAnswerId(answerId);
    try {
      await voteAnswerMutation.mutateAsync({ answerId });
    } catch {
      // handled via mutation callbacks
    } finally {
      setSupportingAnswerId((current) =>
        current === answerId ? null : current,
      );
    }
  };

  const handleWithdrawSupport = async (answerId: number) => {
    if (!requireAuth()) {
      return;
    }
    setWithdrawingAnswerId(answerId);
    try {
      await unvoteAnswerMutation.mutateAsync({ answerId });
    } catch {
      // handled globally
    } finally {
      setWithdrawingAnswerId((current) =>
        current === answerId ? null : current,
      );
    }
  };

  const handleThreadSentimentChange = async (value: string) => {
    if (value === 'all' || !isValidSentimentValue(value) || !requireAuth()) {
      return;
    }
    try {
      await setSentimentMutation.mutateAsync({
        threadId: numericThreadId,
        type: value,
      });
      setThreadSentimentSelection(value);
      addToast({
        title: 'Sentiment recorded',
        description: 'Thanks for sharing your perspective.',
        color: 'success',
      });
    } catch {
      // Errors handled in mutation
    }
  };

  const handleAnswerSentimentChange = async (
    answerId: number,
    value: string,
  ) => {
    if (value === 'all' || !isValidSentimentValue(value) || !requireAuth()) {
      return;
    }
    try {
      await setSentimentMutation.mutateAsync({
        answerId,
        type: value,
      });
      addToast({
        title: 'Sentiment recorded',
        description: 'Thanks for reviewing this answer.',
        color: 'success',
      });
    } catch {
      // handled globally
    }
  };

  const answersFromApi = useMemo<AnswerItem[]>(() => {
    const remoteItems = answersQuery.data?.pages?.length
      ? answersQuery.data.pages.flatMap((page) => page.items)
      : [];
    const sourceItems =
      remoteItems.length > 0 ? remoteItems : fallbackAnswerRecords;
    if (!sourceItems.length) return [];

    return sourceItems.map((answer) => {
      const sentiment = summarizeSentiments(answer.sentiments);
      const sentimentKey = sentiment.dominantKey ?? 'recommend';
      const viewerSentiment = findUserSentiment(answer.sentiments, user?.id);
      const mappedComments: CommentItem[] = (answer.comments ?? []).map(
        (comment) => ({
          id: `answer-${answer.id}-comment-${comment.id}`,
          numericId: comment.id,
          answerId: answer.id,
          author: comment.creator?.name ?? 'Anonymous',
          role: 'Community Member',
          createdAt: formatTimeAgo(comment.createdAt),
          body: comment.content,
          sentimentLabel: 'recommend',
        }),
      );

      return {
        id: `answer-${answer.id}`,
        numericId: answer.id,
        author: answer.creator?.name ?? 'Anonymous',
        role: 'Community Member',
        createdAt: formatTimeAgo(answer.createdAt),
        body: answer.content,
        cpSupport: answer.voteCount ?? 0,
        cpTarget: undefined,
        sentimentLabel: sentimentKey,
        sentimentVotes: sentiment.totalVotes,
        commentsCount: mappedComments.length,
        comments: mappedComments,
        viewerSentiment: viewerSentiment ?? undefined,
        viewerHasSupported: Boolean(answer.viewerHasSupported),
      } satisfies AnswerItem;
    });
  }, [answersQuery.data, fallbackAnswerRecords, user?.id]);

  const commentsFromApi = useMemo<CommentItem[]>(() => {
    const remoteItems = commentsQuery.data?.pages?.length
      ? commentsQuery.data.pages.flatMap((page) => page.items)
      : [];
    const sourceItems =
      remoteItems.length > 0 ? remoteItems : fallbackCommentRecords;
    if (!sourceItems.length) return [];

    return sourceItems.map((comment) => ({
      id: `comment-${comment.id}`,
      numericId: comment.id,
      answerId: comment.answerId ?? undefined,
      author: comment.creator?.name ?? 'Anonymous',
      role: 'Community Member',
      createdAt: formatTimeAgo(comment.createdAt),
      body: comment.content,
      sentimentLabel: 'recommend',
    }));
  }, [commentsQuery.data, fallbackCommentRecords]);

  const isAnswersInitialLoading =
    answersQuery.isLoading && !answersFromApi.length;
  const isCommentsInitialLoading =
    commentsQuery.isLoading && !commentsFromApi.length;

  const sentimentSummary = useMemo(() => {
    if (!baseThread) {
      return { metrics: [], totalVotes: 0 };
    }
    const summary = summarizeSentiments(baseThread.sentiments);
    return {
      metrics: summary.metrics.map((metric) => ({
        key: metric.key,
        percentage: metric.percentage,
        votes: Math.round(
          (metric.percentage / 100) * (summary.totalVotes || 0),
        ),
      })),
      totalVotes: summary.totalVotes,
    };
  }, [baseThread]);

  const thread = useMemo<ThreadDetailRecord | null>(() => {
    if (!baseThread) {
      return null;
    }
    const paragraphs = extractParagraphs(baseThread.post);
    const cpTarget = baseThread.isScam ? 9000 : 2000;
    const cpCurrent = answersFromApi.reduce(
      (max, answer) => Math.max(max, answer.cpSupport),
      0,
    );

    const baseRecord: ThreadDetailRecord = {
      id: String(baseThread.id),
      title: baseThread.title,
      summary: stripHtmlToPlainText(baseThread.post),
      badge: baseThread.isScam ? '⚠️ Scam & Fraud' : 'Complaint Topic',
      status: baseThread.isScam ? 'Alert' : 'Open',
      isScam: baseThread.isScam,
      categories: baseThread.category ?? [],
      tags: baseThread.tags ?? [],
      highlights: [
        { label: 'Answers', value: `${answersFromApi.length}` },
        { label: 'Comments', value: `${commentsFromApi.length}` },
        { label: 'Views', value: '—' },
      ],
      body: paragraphs.length
        ? paragraphs
        : [stripHtmlToPlainText(baseThread.post)],
      cpProgress: {
        current: cpCurrent,
        target: cpTarget,
        label: baseThread.isScam
          ? 'Contribution Points supporting this claim'
          : 'Contribution Points supporting the leading answer',
        helper: baseThread.isScam
          ? 'Reaching the threshold surfaces Scam Alerts across the ecosystem.'
          : 'Reaching the threshold signals community confidence in this answer.',
      },
      sentiment: sentimentSummary.metrics,
      totalSentimentVotes: sentimentSummary.totalVotes,
      answers: baseThread.isScam ? [] : answersFromApi,
      counterClaims: baseThread.isScam ? answersFromApi : undefined,
      comments: commentsFromApi,
      author: {
        name: baseThread.creator?.name ?? 'Anonymous',
        handle: baseThread.creator?.userId
          ? `@${baseThread.creator.userId.slice(0, 8)}`
          : '@anonymous',
        avatarFallback: baseThread.creator?.name?.[0]?.toUpperCase() ?? 'U',
        role: baseThread.isScam ? 'Claim Owner' : 'Community Member',
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
    return (
      <div className="p-10 text-center text-sm text-black/60">
        Loading thread…
      </div>
    );
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

  const answersToRender = thread.isScam
    ? (thread.counterClaims ?? [])
    : thread.answers;

  const tabOptions = thread.isScam
    ? [
        {
          key: 'answers',
          label: 'Counter Claims',
          count: answersToRender.length,
        },
        { key: 'comments', label: 'Discussion', count: thread.comments.length },
      ]
    : [
        {
          key: 'answers',
          label: 'Answers',
          count: answersToRender.length,
        },
        { key: 'comments', label: 'Discuss', count: thread.comments.length },
      ];

  const filteredAnswers =
    sentimentFilter === 'all'
      ? answersToRender
      : answersToRender.filter(
          (answer) => answer.sentimentLabel === sentimentFilter,
        );

  const filteredComments =
    sentimentFilter === 'all'
      ? thread.comments
      : thread.comments.filter(
          (comment) => comment.sentimentLabel === sentimentFilter,
        );

  const isAnswersTab = activeTab === 'answers';
  const answerComposerTitle = thread.isScam
    ? 'Share a counter claim'
    : 'Share an answer';
  const answerComposerPlaceholder = thread.isScam
    ? 'Document remediation progress or counter evidence.'
    : 'Outline actionable steps to resolve this complaint.';
  const answerEmptyState = thread.isScam
    ? {
        title: 'No counter claims yet',
        description:
          'Share evidence or remediation updates to challenge this claim.',
      }
    : {
        title: 'No answers yet',
        description:
          'Be the first to propose accountable steps for resolution.',
      };
  const discussionEmptyState = {
    title: 'No discussion yet',
    description:
      'Ask clarifying questions or share context to help the community respond.',
  };

  const sentimentMetrics: SentimentMetric[] = thread.sentiment.map(
    (metric) => ({
      key: metric.key,
      percentage: metric.percentage,
    }),
  );

  const cpPercent = Math.min(
    100,
    Math.round((thread.cpProgress.current / thread.cpProgress.target) * 100),
  );

  return (
    <div className="flex items-start justify-center gap-[40px] pt-[20px]">
      <section className="w-[700px] space-y-6">
        <PostDetailCard
          title={thread.title}
          author={thread.author.name}
          timeAgo={thread.author.postedAt}
          contentHtml={threadContentHtml}
          tags={thread.tags}
          categoryLabel={
            thread.categories[0] ?? (thread.isScam ? 'Scam & Fraud' : 'General')
          }
          onAnswer={() => setShowAnswerComposer(true)}
          onComment={() => setShowCommentComposer(true)}
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
          <div className="space-y-5 pt-5">
            {isAnswersTab ? (
              <>
                {showAnswerComposer ? (
                  <ComposerCard
                    title={answerComposerTitle}
                    placeholder={answerComposerPlaceholder}
                    value={answerDraft}
                    onChange={(value) => setAnswerDraft(value)}
                    onSubmit={handleSubmitAnswer}
                    onCancel={() => setShowAnswerComposer(false)}
                    submitLabel={
                      createAnswerMutation.isPending
                        ? 'Submitting…'
                        : 'Publish answer'
                    }
                    isSubmitting={createAnswerMutation.isPending}
                    error={answerError}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAnswerComposer(true)}
                    className="w-full rounded-[12px] border border-dashed border-black/20 bg-white px-4 py-3 text-left text-sm font-semibold text-black/50 transition hover:border-black/40 hover:text-black"
                  >
                    {thread.isScam
                      ? 'Post a counter claim to challenge this alert'
                      : 'Share an answer with actionable next steps'}
                  </button>
                )}
                {isAnswersInitialLoading ? (
                  <div className="rounded-[12px] border border-dashed border-black/15 bg-white/80 px-4 py-6 text-center text-sm text-black/60">
                    Loading answers…
                  </div>
                ) : null}
                {filteredAnswers.length
                  ? filteredAnswers.map((answer) => (
                      <AnswerCard
                        key={answer.id}
                        answer={answer}
                        isScam={thread.isScam}
                        onSupport={handleSupportAnswer}
                        onWithdraw={handleWithdrawSupport}
                        onSentimentChange={handleAnswerSentimentChange}
                        supportPending={supportingAnswerId === answer.numericId}
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
                      Load more {thread.isScam ? 'counter claims' : 'answers'}
                    </Button>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                {showCommentComposer ? (
                  <ComposerCard
                    title="Post a comment"
                    placeholder="Add context, questions, or sentiment to keep the thread active."
                    value={commentDraft}
                    onChange={(value) => setCommentDraft(value)}
                    onSubmit={handleSubmitComment}
                    onCancel={() => setShowCommentComposer(false)}
                    submitLabel={
                      createCommentMutation.isPending
                        ? 'Posting…'
                        : 'Publish comment'
                    }
                    isSubmitting={createCommentMutation.isPending}
                    error={commentError}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCommentComposer(true)}
                    className="w-full rounded-[12px] border border-dashed border-black/20 bg-white px-4 py-3 text-left text-sm font-semibold text-black/50 transition hover:border-black/40 hover:text-black"
                  >
                    Post a comment to guide the discussion
                  </button>
                )}
                {isCommentsInitialLoading ? (
                  <div className="rounded-[12px] border border-dashed border-black/15 bg-white/80 px-4 py-6 text-center text-sm text-black/60">
                    Loading discussion…
                  </div>
                ) : null}
                {filteredComments.length
                  ? filteredComments.map((comment) => (
                      <CommentCard key={comment.id} comment={comment} />
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
          isScam={thread.isScam}
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
  );
}

function extractParagraphs(raw?: string) {
  if (!raw) return [];
  const text = stripHtmlToPlainText(raw).trim();
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function findUserSentiment(
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

function isValidSentimentValue(value: string): value is SentimentKey {
  return SENTIMENT_KEYS.includes(value as SentimentKey);
}

export { SentimentSummaryPanel };
