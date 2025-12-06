'use client';

import { CaretCircleUp, ChartBar, ShieldWarning } from '@phosphor-icons/react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { Button, MdEditor } from '@/components/base';
import { addToast } from '@/components/base/toast';
import { SentimentKey } from '@/components/pages/discourse/common/sentiment/sentimentConfig';
import { SentimentSummaryPanel } from '@/components/pages/discourse/common/sentiment/SentimentModal';
import { TopbarFilters } from '@/components/pages/discourse/common/TopbarFilters';
import BackHeader from '@/components/pages/project/BackHeader';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import { formatTimeAgo } from '@/lib/utils';

import { ThreadDetailRecord } from '../common/threadData';
import { UserAvatar } from '../common/UserAvatar';
import { REDRESSED_SUPPORT_THRESHOLD } from '../utils/constants';
import { EDITOR_MAX_CHARACTERS } from '../utils/editorValue';
import {
  SENTIMENT_KEYS,
  stripHtmlToPlainText,
} from '../utils/threadTransforms';

import { useAnswerSupport } from './hooks/useAnswerSupport';
import { useDiscussionComposer } from './hooks/useDiscussionComposer';
import { useDiscussionLists } from './hooks/useDiscussionLists';
import { serializeEditorValue } from './PostDetailCard';
import {
  ContributionVotesCompact,
  CounterClaimCard,
  DiscussionCommentCard,
  ParticipateCard,
  ScamEmptyState,
} from './ScamDetailCards';
import { ThreadComposerModal } from './ThreadComposerModal';
import { ScamThreadSkeleton } from './ThreadDetailSkeleton';
import { buildSentimentSummary } from './utils/discussionMappers';

const sentimentFilterOptions: Array<'all' | SentimentKey> = [
  'all',
  ...SENTIMENT_KEYS,
];

type ScamThreadDetailPageProps = {
  threadId: string;
};

export function ScamThreadDetailPage({ threadId }: ScamThreadDetailPageProps) {
  const { isAuthenticated, showAuthPrompt, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'counter' | 'discussion'>(
    'counter',
  );
  const [sortOption, setSortOption] = useState<'top' | 'new'>('top');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | SentimentKey>(
    'all',
  );
  const [hasSupportedThread, setHasSupportedThread] = useState(false);
  const [threadSupportPending, setThreadSupportPending] = useState(false);
  const [threadWithdrawPending, setThreadWithdrawPending] = useState(false);

  const numericThreadId = Number(threadId);
  const isValidThreadId = Number.isFinite(numericThreadId);

  const requireAuth = () => {
    if (isAuthenticated) return true;
    showAuthPrompt();
    return false;
  };

  const threadQuery = trpc.projectDiscussionThread.getThreadById.useQuery(
    { threadId: numericThreadId },
    { enabled: isValidThreadId },
  );
  const utils = trpc.useUtils();
  const voteThreadMutation =
    trpc.projectDiscussionThread.voteThread.useMutation();
  const unvoteThreadMutation =
    trpc.projectDiscussionThread.unvoteThread.useMutation();
  const voteAnswerMutation =
    trpc.projectDiscussionInteraction.voteAnswer.useMutation();
  const unvoteAnswerMutation =
    trpc.projectDiscussionInteraction.unvoteAnswer.useMutation();
  const createCounterClaimMutation =
    trpc.projectDiscussionInteraction.createAnswer.useMutation({
      onSuccess: () => {
        addToast({
          title: 'Counter claim submitted',
          description: 'Your counter claim is now visible.',
          color: 'success',
        });
        answersQuery.refetch();
      },
      onError: (error) => {
        addToast({
          title: 'Failed to submit counter claim',
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
          description: 'Your discussion is now visible.',
          color: 'success',
        });
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

  const {
    composerVariant,
    modalVariant,
    isPrimaryComposer,
    primaryDraft: counterDraft,
    commentDraft,
    primaryError: counterError,
    commentError,
    commentComposerTitle,
    commentContext,
    openPrimaryComposer: openCounterComposer,
    openCommentComposer,
    closeComposer: handleCloseComposer,
    handleSubmitPrimary: handleSubmitCounterClaim,
    handleSubmitComment,
    setPrimaryDraft: setCounterDraft,
    setCommentDraft,
  } = useDiscussionComposer({
    primaryVariant: 'counter',
    threadId: numericThreadId,
    maxCharacters: EDITOR_MAX_CHARACTERS,
    requireAuth,
    defaultCommentTarget: { threadId: numericThreadId },
    messages: {
      primary: {
        required: 'Content is required',
        exceed: 'Content exceeds the character limit',
        failed: 'Failed to submit',
      },
      comment: {
        required: 'Content is required',
        exceed: 'Content exceeds the character limit',
        failed: 'Failed to post comment',
      },
    },
    primarySubmit: async ({ html }) => {
      if (!isValidThreadId) return;
      await createCounterClaimMutation.mutateAsync({
        threadId: numericThreadId,
        content: html,
      });
    },
    commentSubmit: async ({ html, target }) => {
      if (!isValidThreadId) return;
      await createCommentMutation.mutateAsync({
        threadId: target.threadId,
        parentCommentId: target.parentCommentId,
        answerId: target.answerId,
        content: html,
      });
    },
    primarySubmitting: createCounterClaimMutation.isPending,
    commentSubmitting: createCommentMutation.isPending,
  });

  const guardedOpenCounterComposer = () => {
    if (!requireAuth()) return;
    openCounterComposer();
  };

  const guardedOpenCommentComposer = (
    options?: Parameters<typeof openCommentComposer>[0],
  ) => {
    if (!requireAuth()) return;
    openCommentComposer(options);
  };
  const openThreadCommentComposer = () =>
    guardedOpenCommentComposer({
      target: { threadId: numericThreadId },
    });

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

  useEffect(() => {
    const viewerHasSupported = (
      threadQuery.data as { viewerHasSupported?: boolean }
    )?.viewerHasSupported;
    setHasSupportedThread(Boolean(viewerHasSupported));
  }, [threadQuery.data]);

  const isThreadOwner = useMemo(() => {
    const creatorId = threadQuery.data?.creator?.userId;
    if (!creatorId || !user?.id) return false;
    return creatorId === user.id;
  }, [threadQuery.data?.creator?.userId, user?.id]);

  const [isThreadRetracted, setIsThreadRetracted] = useState(false);
  const canRetractThread = isThreadOwner && !isThreadRetracted;

  const {
    answers: counterClaims,
    comments: discussionComments,
    filteredAnswers: filteredCounterClaims,
    filteredComments,
  } = useDiscussionLists({
    answersQuery,
    commentsQuery,
    defaultRole: 'Community Member',
    sentimentFilter,
  });

  const {
    handleSupport: handleSupportClaim,
    handleWithdraw: handleWithdrawClaim,
    supportingId: supportingClaimId,
    withdrawingId: withdrawingClaimId,
  } = useAnswerSupport({
    requireAuth,
    answers: counterClaims,
    voteAnswer: async (answerId) => {
      await voteAnswerMutation.mutateAsync({ answerId });
      addToast({
        title: 'Supported counter claim',
        description: 'CP support registered successfully.',
        color: 'success',
      });
      await answersQuery.refetch();
    },
    unvoteAnswer: async (answerId) => {
      await unvoteAnswerMutation.mutateAsync({ answerId });
      addToast({
        title: 'Support withdrawn',
        description: 'Your CP support was withdrawn.',
        color: 'success',
      });
      await answersQuery.refetch();
    },
    onSupportError: (error) =>
      addToast({
        title: 'Unable to support',
        description: (error as Error)?.message ?? 'Please try again.',
        color: 'danger',
      }),
    onWithdrawError: (error) =>
      addToast({
        title: 'Unable to withdraw',
        description: (error as Error)?.message ?? 'Please try again.',
        color: 'danger',
      }),
    onFinally: () => {
      utils.projectDiscussionThread.listThreads.invalidate();
    },
  });

  const sentimentSummary = useMemo(
    () => buildSentimentSummary(threadQuery.data?.sentiments),
    [threadQuery.data?.sentiments],
  );

  const hydratedThread = useMemo<ThreadDetailRecord | null>(() => {
    const remoteThread = threadQuery.data;
    if (!remoteThread) {
      return null;
    }

    const summary = buildSentimentSummary(remoteThread.sentiments);
    const authorName = remoteThread.creator?.name ?? 'Anonymous';
    const authorHandle = remoteThread.creator?.userId
      ? `@${remoteThread.creator.userId.slice(0, 8)}`
      : '@anonymous';

    return {
      ...remoteThread,
      summary: stripHtmlToPlainText(remoteThread.post),
      badge: 'Scam & Fraud',
      status: 'Open',
      isScam: true,
      categories: remoteThread.category ?? [],
      tags: remoteThread.tags ?? [],
      highlights: [],
      body: [stripHtmlToPlainText(remoteThread.post)],
      attachmentsCount: 0,
      cpProgress: {
        current: remoteThread.support ?? 0,
        target: REDRESSED_SUPPORT_THRESHOLD,
        label: 'Contribution Points supporting the main claim',
        helper:
          'Cross the threshold to pin the alert across the project surfaces.',
      },
      sentiment: summary.metrics,
      totalSentimentVotes: summary.totalVotes,
      answers: [], // scam view drives on counterClaims
      counterClaims,
      comments: discussionComments,
      author: {
        name: authorName,
        handle: authorHandle,
        avatarFallback: authorName[0]?.toUpperCase() ?? 'U',
        avatarUrl: remoteThread.creator?.avatarUrl ?? null,
        role: 'Community Member',
        postedAt: formatTimeAgo(remoteThread.createdAt),
      },
      participation: {
        supportSteps: [],
        counterSteps: [],
      },
      quickActions: [],
      canRetract: canRetractThread,
    };
  }, [canRetractThread, counterClaims, discussionComments, threadQuery.data]);

  const handleToggleThreadSupport = async () => {
    if (!isValidThreadId || !requireAuth()) {
      return;
    }
    if (isThreadRetracted) {
      addToast({
        title: 'Claim already retracted',
        description: 'This claim can no longer receive support.',
        color: 'warning',
      });
      return;
    }
    const action = hasSupportedThread ? 'withdraw' : 'support';
    if (hasSupportedThread) {
      setThreadWithdrawPending(true);
    } else {
      setThreadSupportPending(true);
    }
    try {
      if (hasSupportedThread) {
        await unvoteThreadMutation.mutateAsync({ threadId: numericThreadId });
        setHasSupportedThread(false);
        addToast({
          title: 'Support withdrawn',
          description: 'Your CP support was withdrawn.',
          color: 'success',
        });
      } else {
        await voteThreadMutation.mutateAsync({ threadId: numericThreadId });
        setHasSupportedThread(true);
        addToast({
          title: 'Supported claim',
          description: 'CP support registered for this scam claim.',
          color: 'success',
        });
      }
      threadQuery.refetch();
      utils.projectDiscussionThread.listThreads.invalidate();
    } catch (error: any) {
      addToast({
        title: 'Unable to update support',
        description: error?.message ?? 'Please try again.',
        color: 'danger',
      });
    } finally {
      if (action === 'support') {
        setThreadSupportPending(false);
      } else {
        setThreadWithdrawPending(false);
      }
    }
  };

  const handleRetractClaim = async () => {
    if (!isValidThreadId || !requireAuth() || !canRetractThread) {
      return;
    }
    // TODO: hook up backend retract API once available
    // setIsThreadRetracted(true);
    addToast({
      title: 'This feature is coming soon',
      description: 'Retracting claims will be available in a future update.',
      color: 'warning',
    });
  };

  const tabItems = [
    {
      key: 'discussion' as const,
      label: 'Discussion',
      count: hydratedThread?.comments.length ?? 0,
    },
    {
      key: 'counter' as const,
      label: 'Counter Claims',
      count: hydratedThread?.counterClaims?.length ?? 0,
    },
  ];

  if (!isValidThreadId) {
    return (
      <div className="p-10 text-center text-sm text-black/60">
        Invalid thread identifier.
      </div>
    );
  }

  if (threadQuery.isLoading) {
    return <ScamThreadSkeleton />;
  }

  if (!hydratedThread) {
    return (
      <div className="p-10 text-center text-sm text-black/60">
        Thread not found.
      </div>
    );
  }

  return (
    <div className="flex justify-center px-[20px] pb-16 pt-4">
      <div className="flex w-full max-w-[1200px] gap-[40px]">
        <section className="w-[700px] space-y-[20px]">
          <BackHeader className="px-0">
            <Link href="/discourse" className="text-[14px] text-black/70">
              Discourse
            </Link>
            <span className="text-black/25">/</span>
            <span className="text-[14px] text-black/70">Crumb</span>
          </BackHeader>

          <article className="space-y-[12px]">
            <div className="inline-flex items-center gap-[6px] rounded-[4px] border border-[rgba(0,0,0,0.1)] bg-[#ebebeb] px-[8px] py-[4px]">
              <ShieldWarning
                size={18}
                weight="fill"
                className="text-black/70"
              />
              <span className="text-[13px] font-semibold text-black/80">
                Scam &amp; Fraud
              </span>
            </div>
            <h1 className="text-[20px] font-medium leading-[22px] text-black">
              {hydratedThread.title}
            </h1>
            <div className="flex flex-wrap items-center gap-[10px] text-[12px] text-black">
              <span className="text-black/50">BY:</span>
              <div className="flex items-center gap-[5px]">
                <UserAvatar
                  name={hydratedThread.author.name}
                  src={hydratedThread.author.avatarUrl}
                  size={24}
                />
                <span className="text-[14px]">
                  {hydratedThread.author.name}
                </span>
              </div>
              <span className="text-black/60">
                {hydratedThread.author.postedAt}
              </span>
            </div>
            <MdEditor
              value={serializeEditorValue(hydratedThread.post)}
              mode="readonly"
              hideMenuBar
              className={{
                base: 'border-none bg-transparent p-0',
                editorWrapper: 'p-0',
                editor:
                  'prose prose-base max-w-none text-[16px] leading-[20px] text-black/80',
              }}
            />
            <div className="flex flex-wrap items-center gap-[10px] text-[14px] text-black/60">
              <span className="font-semibold text-black/50">Tags:</span>
              {hydratedThread.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-[6px] bg-black/5 px-[10px] py-[5px] text-xs font-[600] text-black"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-[8px]">
              <div className="inline-flex items-center gap-[6px] rounded-[8px] bg-[#ebebeb] px-[8px] py-[4px]">
                <ChartBar size={22} weight="fill" className="text-black/40" />
                <span className="text-[12px] font-semibold text-black/60">
                  {hydratedThread.attachmentsCount ?? 4}
                </span>
              </div>
            </div>
            <Button
              className="h-[38px] w-full gap-[10px] rounded-[8px] border-none bg-[#EBEBEB] text-black"
              isDisabled={
                threadSupportPending ||
                threadWithdrawPending ||
                isThreadRetracted
              }
              isLoading={threadSupportPending || threadWithdrawPending}
              onPress={handleToggleThreadSupport}
            >
              <CaretCircleUp
                size={30}
                weight="fill"
                className={hasSupportedThread ? 'text-black' : 'text-black/10'}
              />
              <span className="font-inter text-[14px] font-[500]">
                Support This Claim
              </span>
              <span className="text-[12px] font-[400]">
                {hydratedThread.cpProgress.current} /{' '}
                {hydratedThread.cpProgress.target}
              </span>
            </Button>
            <div className="mt-[20px] flex flex-col gap-[10px] border-t border-black/10 pt-[10px]">
              {isThreadOwner ? (
                <Button
                  className="h-[38px] rounded-[5px] bg-[#51A0C5] text-[13px] font-semibold text-white hover:bg-[#4c90ac]"
                  onPress={handleRetractClaim}
                  isDisabled={!canRetractThread}
                  isLoading={false}
                >
                  Retract Your Claim
                </Button>
              ) : (
                <>
                  <Button
                    className="h-[38px] rounded-[5px] bg-[#222222] text-[13px] font-semibold text-white hover:bg-black/85"
                    onPress={() => {
                      if (isThreadRetracted) {
                        addToast({
                          title: 'Claim already retracted',
                          description:
                            'Counter claims are disabled for retracted alerts.',
                          color: 'warning',
                        });
                        return;
                      }
                      guardedOpenCounterComposer();
                    }}
                    isDisabled={isThreadRetracted}
                    isLoading={createCounterClaimMutation.isPending}
                  >
                    Counter This Claim
                  </Button>
                  <Button
                    className="h-[38px] rounded-[5px] border border-black/10 text-[13px] font-semibold text-black/80"
                    onPress={() => {
                      if (isThreadRetracted) {
                        addToast({
                          title: 'Claim already retracted',
                          description:
                            'Comments are disabled for retracted alerts.',
                          color: 'warning',
                        });
                        return;
                      }
                      openThreadCommentComposer();
                    }}
                    isDisabled={isThreadRetracted}
                    isLoading={createCommentMutation.isPending}
                  >
                    Post Comment
                  </Button>
                </>
              )}
            </div>
          </article>

          <TopbarFilters
            statusTabs={tabItems.map((tab) => tab.key)}
            activeStatus={activeTab}
            onStatusChange={(value) =>
              setActiveTab(value === 'discussion' ? 'discussion' : 'counter')
            }
            sortOptions={['top', 'new']}
            activeSort={sortOption}
            onSortChange={(value) =>
              setSortOption(value === 'new' ? 'new' : 'top')
            }
            sentimentOptions={sentimentFilterOptions}
            selectedSentiment={sentimentFilter}
            onSentimentChange={(value) =>
              setSentimentFilter((value as 'all' | SentimentKey) ?? 'all')
            }
            renderStatusLabel={(value) => {
              const tab = tabItems.find((item) => item.key === value);
              return (
                <span className="flex items-center gap-2">
                  <span className="text-[14px]  text-black">
                    {tab?.label ?? value}
                  </span>
                  <span className="rounded-[4px] px-1 text-[11px] text-black/60">
                    {tab?.count ?? 0}
                  </span>
                </span>
              );
            }}
          />

          <div className="space-y-4">
            {activeTab === 'counter' ? (
              filteredCounterClaims.length ? (
                filteredCounterClaims.map((claim) => (
                  <CounterClaimCard
                    key={claim.id}
                    claim={claim}
                    cpTarget={hydratedThread.cpProgress.target}
                    threadId={numericThreadId}
                    onSupport={handleSupportClaim}
                    onWithdraw={handleWithdrawClaim}
                    supportPending={supportingClaimId === claim.numericId}
                    withdrawPending={withdrawingClaimId === claim.numericId}
                    onPostComment={(context) =>
                      guardedOpenCommentComposer({
                        title: 'Commenting to Counter Claim:',
                        context: {
                          title: 'Commenting to:',
                          author: context.author,
                          excerpt: context.excerpt,
                          timestamp: context.timestamp,
                          isOp: context.isOp,
                          target: context.target,
                        },
                        target: context.target,
                      })
                    }
                  />
                ))
              ) : (
                <ScamEmptyState
                  title="No counter claims yet"
                  description="Create a counter claim to contest this alert and gather CP support."
                />
              )
            ) : filteredComments.length ? (
              filteredComments.map((comment) => (
                <DiscussionCommentCard key={comment.id} comment={comment} />
              ))
            ) : (
              <ScamEmptyState
                title="No comments yet"
                description="Start a discussion to add evidence or confirm remediation."
              />
            )}
          </div>
        </section>

        <aside className="w-[300px] space-y-[20px]">
          {isThreadOwner ? (
            <Button
              className="h-[38px] w-full rounded-[5px] bg-[#51A0C5] text-[13px] font-semibold text-white hover:bg-[#4c90ac]"
              onPress={handleRetractClaim}
              isDisabled={!canRetractThread}
              isLoading={false}
            >
              Retract Your Claim
            </Button>
          ) : null}

          <ContributionVotesCompact
            current={hydratedThread.cpProgress.current}
            label="Contribution Point Votes"
            isScam={true}
          />

          <SentimentSummaryPanel
            sentiments={sentimentSummary.metrics.map((metric) => ({
              key: metric.key,
              percentage: metric.percentage,
            }))}
            totalVotes={sentimentSummary.totalVotes}
            customHeader={
              <div className="flex items-center gap-[10px]">
                <ChartBar size={20} weight="fill" />
                <span className="text-[14px] font-[600]">User Sentiment</span>
              </div>
            }
          />

          <ParticipateCard isOwner={isThreadOwner} />
        </aside>
      </div>

      {composerVariant ? (
        <ThreadComposerModal
          isOpen
          variant={modalVariant}
          value={isPrimaryComposer ? counterDraft : commentDraft}
          onChange={(value) =>
            isPrimaryComposer ? setCounterDraft(value) : setCommentDraft(value)
          }
          onSubmit={
            isPrimaryComposer ? handleSubmitCounterClaim : handleSubmitComment
          }
          onClose={handleCloseComposer}
          isSubmitting={
            isPrimaryComposer
              ? createCounterClaimMutation.isPending
              : createCommentMutation.isPending
          }
          error={isPrimaryComposer ? counterError : commentError}
          threadTitle={hydratedThread.title}
          threadCategory={hydratedThread.categories?.[0]}
          isScam
          contextCard={
            !isPrimaryComposer ? (commentContext ?? undefined) : undefined
          }
          titleOverride={!isPrimaryComposer ? commentComposerTitle : undefined}
        />
      ) : null}
    </div>
  );
}

function renderSummaryWithLinks(text: string) {
  const match = text.match(/(https?:\/\/\S+)/);
  if (!match || match.index === undefined) {
    return text;
  }

  const link = match[0];
  const prefixText = text.slice(0, match.index);
  const suffix = text.slice(match.index + link.length);

  return (
    <>
      {prefixText}
      <a
        href={link}
        className="text-[#1b9573]"
        target="_blank"
        rel="noreferrer"
      >
        {link}
      </a>
      {suffix}
    </>
  );
}
