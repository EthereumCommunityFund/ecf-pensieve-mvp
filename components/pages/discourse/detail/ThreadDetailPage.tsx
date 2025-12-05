'use client';

import {
  ArrowBendUpLeft,
  CaretCircleUpIcon,
  ChartBar as ChartBarGlyph,
  ChartBarIcon,
  ThumbsDown,
} from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Button, MdEditor } from '@/components/base';
import { addToast } from '@/components/base/toast';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import { formatTimeAgo } from '@/lib/utils';

import { SentimentKey } from '../common/sentiment/sentimentConfig';
import { SentimentIndicator } from '../common/sentiment/SentimentIndicator';
import { SentimentSummaryPanel } from '../common/sentiment/SentimentModal';
import {
  AnswerItem,
  CommentItem,
  QuickAction,
  ThreadDetailRecord,
} from '../common/threadData';
import { TopbarFilters } from '../common/TopbarFilters';
import { EDITOR_MAX_CHARACTERS, parseEditorValue } from '../utils/editorValue';
import {
  SENTIMENT_KEYS,
  stripHtmlToPlainText,
  summarizeSentiments,
  type ThreadSentimentRecord,
} from '../utils/threadTransforms';

import { ContributionVotesCard } from './ContributionVotesCard';
import { EmptyState } from './EmptyState';
import { mockThreadAnswers, mockThreadComments } from './mockDiscussionData';
import PostDetailCard, { serializeEditorValue } from './PostDetailCard';
import { QuickActionsCard } from './QuickActionsCard';
import { ComposerContext, ThreadComposerModal } from './ThreadComposerModal';

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
  const [composerVariant, setComposerVariant] = useState<
    'answer' | 'comment' | null
  >(null);
  const [commentComposerTitle, setCommentComposerTitle] = useState<
    string | undefined
  >(undefined);
  const [commentContext, setCommentContext] = useState<ComposerContext | null>(
    null,
  );
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
  const isAnswerComposer = useMemo(
    () => composerVariant === 'answer',
    [composerVariant],
  );

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
        setComposerVariant(null);
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
        setComposerVariant(null);
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

  const handleSubmitAnswer = async () => {
    if (!isValidThreadId || !requireAuth()) {
      return;
    }
    const { html, plain: plainText } = parseEditorValue(answerDraft);
    if (!plainText) {
      setAnswerError('Answer content is required');
      return;
    }
    if (plainText.length > EDITOR_MAX_CHARACTERS) {
      setAnswerError('Answer exceeds the character limit');
      return;
    }
    setAnswerError(null);
    try {
      await createAnswerMutation.mutateAsync({
        threadId: numericThreadId,
        content: html,
      });
      setComposerVariant(null);
    } catch (error: any) {
      setAnswerError(error.message ?? 'Failed to submit answer');
    }
  };

  const handleSubmitComment = async () => {
    if (!isValidThreadId || !requireAuth()) {
      return;
    }
    const { html, plain: plainText } = parseEditorValue(commentDraft);
    if (!plainText) {
      setCommentError('Comment content is required');
      return;
    }
    if (plainText.length > EDITOR_MAX_CHARACTERS) {
      setCommentError('Comment exceeds the character limit');
      return;
    }
    setCommentError(null);
    try {
      await createCommentMutation.mutateAsync({
        threadId: numericThreadId,
        content: html,
      });
      setComposerVariant(null);
    } catch (error: any) {
      setCommentError(error.message ?? 'Failed to post comment');
    }
  };

  const handleCloseComposer = () => {
    if (isAnswerComposer && createAnswerMutation.isPending) {
      return;
    }
    if (
      !isAnswerComposer &&
      composerVariant &&
      createCommentMutation.isPending
    ) {
      return;
    }
    setComposerVariant(null);
    setAnswerError(null);
    setCommentError(null);
    setCommentComposerTitle(undefined);
    setCommentContext(null);
  };

  const openCommentComposer = (options?: {
    title?: string;
    context?: ComposerContext | null;
  }) => {
    setCommentComposerTitle(options?.title);
    setCommentContext(options?.context ?? null);
    setComposerVariant('comment');
  };

  const openAnswerComposer = () => {
    setComposerVariant('answer');
    setCommentComposerTitle(undefined);
    setCommentContext(null);
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
    const cpTarget = 2000;
    const cpCurrent = answersFromApi.reduce(
      (max, answer) => Math.max(max, answer.cpSupport),
      0,
    );

    const baseRecord: ThreadDetailRecord = {
      id: String(baseThread.id),
      title: baseThread.title,
      summary: stripHtmlToPlainText(baseThread.post),
      badge: 'Complaint Topic',
      status: 'Open',
      isScam: false,
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

  const answersToRender = thread.answers;

  const tabOptions = [
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
            timeAgo={thread.author.postedAt}
            contentHtml={threadContentHtml}
            tags={thread.tags}
            categoryLabel={thread.categories[0] ?? 'General'}
            onAnswer={() => openAnswerComposer()}
            onComment={() => openCommentComposer()}
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
                          onSupport={handleSupportAnswer}
                          onWithdraw={handleWithdrawSupport}
                          onPostComment={(context) =>
                            openCommentComposer({
                              title: 'Post Comment',
                              context,
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
                      onPress={() => openCommentComposer()}
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
                        <CommentThreadItem
                          key={comment.id}
                          comment={comment}
                          showConnector={
                            index === 0 && filteredComments.length > 1
                          }
                          onReply={(context) =>
                            openCommentComposer({
                              title: 'Post Reply',
                              context,
                            })
                          }
                          threadAuthorName={thread.author.name}
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
          variant={composerVariant}
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

type AnswerDetailCardProps = {
  answer: AnswerItem;
  onSupport: (answerId: number) => void;
  onWithdraw: (answerId: number) => void;
  onPostComment: (context?: ComposerContext) => void;
  threadAuthorName: string;
  supportPending?: boolean;
  withdrawPending?: boolean;
};

function AnswerDetailCard({
  answer,
  onSupport,
  onWithdraw,
  onPostComment,
  threadAuthorName,
  supportPending = false,
  withdrawPending = false,
}: AnswerDetailCardProps) {
  const commentCount = answer.comments?.length ?? answer.commentsCount;
  const primaryTag = answer.isAccepted ? 'Highest voted answer' : undefined;
  const secondaryTag =
    answer.statusTag ||
    (answer.viewerHasSupported ? 'Voted by Original Poster' : undefined);
  const cpLabel = formatCompactNumber(answer.cpSupport);
  const isOp = answer.author === threadAuthorName;

  return (
    <article className="rounded-[10px] border border-black/10 bg-white p-[10px]">
      <div className="flex gap-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-[#d9d9d9] text-sm font-semibold text-black/70">
          {answer.author?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-semibold text-black">
                {answer.author}
              </span>
              {primaryTag ? (
                <span className="rounded-[4px] border border-[rgba(67,189,155,0.6)] bg-[rgba(67,189,155,0.1)] px-2 py-1 text-[12px] font-semibold text-[#1b9573]">
                  {primaryTag}
                </span>
              ) : null}
              {secondaryTag ? (
                <span className="rounded-[4px] border border-[rgba(67,189,155,0.6)] bg-[rgba(67,189,155,0.1)] px-2 py-1 text-[12px] font-semibold text-[#1b9573]">
                  {secondaryTag}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2 text-[12px] text-black/70">
              <SentimentIndicator />
            </div>
          </div>

          <div className="flex items-start gap-[10px]">
            <MdEditor
              value={serializeEditorValue(answer.body)}
              mode="readonly"
              hideMenuBar
              className={{
                base: 'h-fit border-none bg-transparent p-0',
                editorWrapper: 'p-0',
                editor:
                  'prose prose-base max-w-none text-[16px] leading-6 text-black/80',
              }}
            />

            <Button className="min-w-0 shrink-0 gap-[5px] rounded-[8px] border-none bg-[#F5F5F5] px-[8px] py-[4px]">
              <span className="font-mona text-[13px] leading-[19px] text-[#64C0A5]">
                2.5k
              </span>
              <CaretCircleUpIcon
                weight="fill"
                size={30}
                className="text-[#64C0A5]"
              />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-black/60">
            <span>{answer.createdAt}</span>
            <div className="inline-flex items-center gap-2 rounded-[8px] bg-[#f2f2f2] px-2 py-1">
              <ChartBarGlyph
                size={16}
                weight="fill"
                className="text-black/40"
              />
              <span className="text-[12px] font-semibold text-black/70">
                {commentCount?.toString() || '0'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-[10px] border-t border-black/10 pt-[10px]">
            <div className="flex items-center justify-between text-[14px] font-semibold text-black/80">
              <div className="flex items-center gap-2">
                <span>Comments</span>
                <span className="text-black/50">
                  {String(commentCount ?? 0).padStart(2, '0')}
                </span>
              </div>
              <Button
                className="h-[32px] rounded-[5px] border border-black/10 bg-[#F5F5F5] px-[10px] text-[13px] font-semibold text-black/80"
                onPress={() =>
                  onPostComment({
                    title: 'Commenting to Answer:',
                    author: answer.author,
                    isOp,
                    timestamp: answer.createdAt,
                    excerpt: formatExcerpt(answer.body),
                  })
                }
              >
                Post Comment
              </Button>
            </div>
            <div className="space-y-[10px]">
              {answer.comments?.length ? (
                answer.comments.map((comment) => (
                  <AnswerCommentRow key={comment.id} comment={comment} />
                ))
              ) : (
                <p className="text-[13px] text-black/60">No comments yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function AnswerCommentRow({ comment }: { comment: CommentItem }) {
  const isOp = comment.author?.toLowerCase().includes('(op)');
  const badgeNumber =
    typeof comment.numericId === 'number'
      ? Math.max(1, comment.numericId % 10)
      : 4;

  return (
    <div className="flex gap-3">
      <div className="flex size-8 items-center justify-center rounded-full bg-[#d9d9d9]" />
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-semibold text-black">
            {comment.author}
          </span>
          {isOp ? (
            <span className="rounded-[4px] border border-white bg-[rgba(67,189,155,0.2)] px-2 py-[2px] text-[11px] font-semibold text-[#1b9573]">
              OP
            </span>
          ) : null}
          <span className="text-[12px] text-black/60">{comment.createdAt}</span>
        </div>
        <MdEditor
          value={serializeEditorValue(comment.body)}
          mode="readonly"
          hideMenuBar
          className={{
            base: 'border-none bg-transparent p-0',
            editorWrapper: 'p-0',
            editor:
              'prose prose-base max-w-none text-[16px] leading-6 text-black/80',
          }}
        />
        <div className="flex items-center gap-3 text-[12px] text-black/70">
          <Button className="inline-flex h-[24px] min-w-0 items-center gap-[5px] rounded-[5px] border-none bg-black/5 px-[8px]">
            <ChartBarIcon size={20} weight="fill" className="opacity-30" />
            <span className="text-[12px] font-semibold text-black">4</span>
          </Button>
          <Button className="h-[24px]  min-w-0 rounded-[5px] border-none bg-black/5 px-[8px] py-[4px] font-sans text-[12px] font-semibold text-black/80">
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
}

function CommentThreadItem({
  comment,
  showConnector = false,
  onReply,
  threadAuthorName,
}: {
  comment: CommentItem;
  showConnector?: boolean;
  onReply: (context?: ComposerContext) => void;
  threadAuthorName: string;
}) {
  const isOp =
    comment.author?.toLowerCase().includes('(op)') ||
    comment.author === threadAuthorName;

  return (
    <div className="relative flex gap-3 rounded-[10px] bg-[#f7f7f7] p-3">
      {showConnector ? (
        <div className="absolute left-[24px] top-[38px] h-[calc(100%-38px)] w-px bg-black/10" />
      ) : null}
      <div className="flex flex-col items-center gap-1">
        <div className="flex size-[30px] items-center justify-center rounded-full bg-[#d9d9d9]" />
        {isOp ? (
          <div className="flex flex-col items-center gap-1 text-black/50">
            <ArrowBendUpLeft size={14} />
            <ThumbsDown size={18} weight="fill" />
          </div>
        ) : null}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-black">
              {comment.author}
            </span>
            {/* TODO sentiment icon */}
            {isOp ? (
              <span className="rounded-[4px] border border-white bg-[rgba(67,189,155,0.2)] px-2 py-[2px] text-[11px] font-semibold text-[#1b9573]">
                OP
              </span>
            ) : null}
            <span className="text-[12px] text-black/60">
              {comment.createdAt}
            </span>
          </div>
          <SentimentIndicator />
        </div>

        <MdEditor
          value={serializeEditorValue(comment.body)}
          mode="readonly"
          hideMenuBar
          className={{
            base: 'h-fit border-none bg-transparent p-0',
            editorWrapper: 'p-0',
            editor:
              'prose prose-base max-w-none text-[16px] leading-6 text-black/80',
          }}
        />

        <div className="flex items-center gap-3 text-[12px] text-black/70">
          <Button className="inline-flex h-[24px] min-w-0 items-center gap-[5px] rounded-[5px] border-none bg-black/5 px-[8px]">
            <ChartBarIcon size={20} weight="fill" className="opacity-30" />
            <span className="text-[12px] font-semibold text-black">4</span>
          </Button>
          <Button
            className="h-[24px]  min-w-0 rounded-[5px] border-none bg-black/5 px-[8px] py-[4px] font-sans text-[12px] font-semibold text-black/80"
            onPress={() =>
              onReply({
                title: 'Replying to:',
                author: comment.author,
                isOp,
                timestamp: comment.createdAt,
                excerpt: formatExcerpt(comment.body),
              })
            }
          >
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function formatExcerpt(text: string, maxLength = 180) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}…`;
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

export { SentimentSummaryPanel };
