'use client';

import { CaretCircleUp, ChartBar, ShieldWarning } from '@phosphor-icons/react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

import { Button, ConfirmModal, MdEditor } from '@/components/base';
import { addToast } from '@/components/base/toast';
import {
  SentimentKey,
  SentimentMetric,
} from '@/components/pages/discourse/common/sentiment/sentimentConfig';
import {
  SentimentModal,
  SentimentSummaryPanel,
} from '@/components/pages/discourse/common/sentiment/SentimentModal';
import { TopbarFilters } from '@/components/pages/discourse/common/TopbarFilters';
import BackHeader from '@/components/pages/project/BackHeader';
import { REDRESSED_SUPPORT_THRESHOLD } from '@/constants/discourse';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';

import { SentimentVoteButton } from '../common/sentiment/SentimentVoteButton';
import { ThreadDetailRecord } from '../common/threadData';
import { UserAvatar } from '../common/UserAvatar';
import { EDITOR_MAX_CHARACTERS } from '../utils/editorValue';
import {
  SENTIMENT_KEYS,
  stripHtmlToPlainText,
} from '../utils/threadTransforms';

import { useAnswerSupport } from './hooks/useAnswerSupport';
import {
  useDiscussionComposer,
  type CommentTarget,
} from './hooks/useDiscussionComposer';
import { useDiscussionLists } from './hooks/useDiscussionLists';
import { ParticipationCard } from './ParticipationCard';
import { serializeEditorValue } from './PostDetailCard';
import {
  ContributionVotesCompact,
  CounterClaimCard,
  ScamEmptyState,
} from './ScamDetailCards';
import { AnswerDetailCardSkeleton } from './ThreadAnswerCard';
import { ThreadCommentSkeleton } from './ThreadCommentSkeleton';
import { ThreadCommentTree } from './ThreadCommentTree';
import { ThreadComposerModal } from './ThreadComposerModal';
import { ThreadDetailSkeleton } from './ThreadDetailSkeleton';
import {
  buildSentimentSummary,
  findUserSentiment,
  normalizeThreadDetailRecord,
} from './utils/discussionMappers';

const STATUS_THEMES: Record<
  string,
  { border: string; bg: string; text: string }
> = {
  'Alert Displayed on Page': {
    border: 'border-[#bb5d00]/40',
    bg: 'bg-[#fff2e5]',
    text: 'text-[#bb5d00]',
  },
  'Claim Redressed': {
    border: 'border-[rgba(67,189,155,0.6)]',
    bg: 'bg-[rgba(67,189,155,0.1)]',
    text: 'text-[#1b9573]',
  },
  Redressed: {
    border: 'border-[rgba(67,189,155,0.6)]',
    bg: 'bg-[rgba(67,189,155,0.1)]',
    text: 'text-[#1b9573]',
  },
};

const getStatusTheme = (status?: string) => {
  if (!status) return null;
  return (
    STATUS_THEMES[status] ?? {
      border: 'border-black/10',
      bg: 'bg-[#f5f5f5]',
      text: 'text-black/80',
    }
  );
};

const sentimentFilterOptions: Array<'all' | SentimentKey> = [
  'all',
  ...SENTIMENT_KEYS,
];

type ScamThreadDetailPageProps = {
  threadId: string;
};

export function ScamThreadDetailPage({ threadId }: ScamThreadDetailPageProps) {
  const { profile, showAuthPrompt, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'counter' | 'discussion'>(
    'counter',
  );
  const [sortOption, setSortOption] = useState<'top' | 'new'>('top');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | SentimentKey>(
    'all',
  );

  const numericThreadId = Number(threadId);
  const isValidThreadId = Number.isFinite(numericThreadId);

  const requireAuth = useCallback(() => {
    if (!profile) {
      showAuthPrompt();
      return false;
    }
    return true;
  }, [profile, showAuthPrompt]);

  const threadQuery = trpc.projectDiscussionThread.getThreadById.useQuery(
    { threadId: numericThreadId },
    { enabled: isValidThreadId },
  );
  const [activeSentimentModal, setActiveSentimentModal] = useState<{
    title: string;
    excerpt: string;
    sentiments?: SentimentMetric[];
    totalVotes?: number;
  } | null>(null);
  const [answerSentimentPendingId, setAnswerSentimentPendingId] = useState<
    number | null
  >(null);
  const viewerSentiment = useMemo(
    () =>
      findUserSentiment(threadQuery.data?.sentiments, user?.id ?? null) ?? null,
    [threadQuery.data?.sentiments, user?.id],
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
  const setThreadSentimentMutation =
    trpc.projectDiscussionInteraction.setSentiment.useMutation();
  const setAnswerSentimentMutation =
    trpc.projectDiscussionInteraction.setSentiment.useMutation();
  const createCounterClaimMutation =
    trpc.projectDiscussionInteraction.createAnswer.useMutation({
      onSuccess: () => {
        addToast({
          title: 'Counter claim submitted',
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
          color: 'success',
        });
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
    defaultCommentTarget: {
      targetType: 'thread',
      targetId: numericThreadId,
      threadId: numericThreadId,
    },
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
      const scope =
        target.targetType === 'answer' || target.answerId ? 'answer' : 'thread';
      await createCommentMutation.mutateAsync({
        targetType: target.targetType,
        targetId: target.targetId,
        content: html,
      });
      if (scope === 'answer') {
        answersQuery.refetch();
      } else {
        commentsQuery.refetch();
      }
    },
    primarySubmitting: createCounterClaimMutation.isPending,
    commentSubmitting: createCommentMutation.isPending,
  });

  const guardedOpenCounterComposer = useCallback(() => {
    if (!requireAuth()) return;
    openCounterComposer();
  }, [openCounterComposer, requireAuth]);

  const guardedOpenCommentComposer = useCallback(
    (options?: Parameters<typeof openCommentComposer>[0]) => {
      if (!requireAuth()) return;
      openCommentComposer(options);
    },
    [openCommentComposer, requireAuth],
  );

  const openThreadCommentComposer = useCallback(
    () =>
      guardedOpenCommentComposer({
        target: {
          targetType: 'thread',
          targetId: numericThreadId,
          threadId: numericThreadId,
        },
      }),
    [guardedOpenCommentComposer, numericThreadId],
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

  const viewerHasSupportedThread = useMemo(
    () =>
      Boolean(
        (threadQuery.data as { viewerHasSupported?: boolean } | undefined)
          ?.viewerHasSupported,
      ),
    [threadQuery.data],
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

  const isThreadOwner = useMemo(() => {
    const creatorId = threadQuery.data?.creator?.userId;
    if (!creatorId || !user?.id) return false;
    return creatorId === user.id;
  }, [threadQuery.data?.creator?.userId, user?.id]);

  const [isThreadRetracted, setIsThreadRetracted] = useState(false);
  const canRetractThread = isThreadOwner && !isThreadRetracted;

  const {
    answers: counterClaims,
    threadComments,
    filteredAnswers: filteredCounterClaims,
    filteredComments,
    isAnswersInitialLoading,
    isCommentsInitialLoading,
  } = useDiscussionLists({
    answersQuery,
    commentsQuery,
    defaultRole: 'Community Member',
    sentimentFilter,
    cpTarget: REDRESSED_SUPPORT_THRESHOLD,
    buildThreadTree: true,
  });
  const topCounterSupport = useMemo(
    () =>
      counterClaims.reduce((max, claim) => Math.max(max, claim.cpSupport), 0),
    [counterClaims],
  );

  const {
    handleSupport: handleSupportClaim,
    handleWithdraw: handleWithdrawClaim,
    supportingId: supportingClaimId,
    withdrawingId: withdrawingClaimId,
    pendingAction,
    pendingIds,
    confirmAction,
    cancelAction,
  } = useAnswerSupport({
    requireAuth,
    answers: counterClaims,
    voteAnswer: async (answerId) => {
      await voteAnswerMutation.mutateAsync({ answerId });
      addToast({
        title: 'Voted successfully',
        color: 'success',
      });
      await answersQuery.refetch();
    },
    unvoteAnswer: async (answerId) => {
      await unvoteAnswerMutation.mutateAsync({ answerId });
      addToast({
        title: 'Unvote successfully',
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
        title: 'Unable to unvote',
        description: (error as Error)?.message ?? 'Please try again.',
        color: 'danger',
      }),
    onFinally: () => {
      utils.projectDiscussionThread.listThreads.invalidate();
    },
  });

  const pendingActionLoading = useMemo(() => {
    if (!pendingIds) return false;
    return (
      pendingIds.supporting === supportingClaimId ||
      pendingIds.withdrawing === withdrawingClaimId
    );
  }, [pendingIds, supportingClaimId, withdrawingClaimId]);

  const pendingModalCopy = useMemo(() => {
    if (!pendingAction) return null;
    if (pendingAction.type === 'switch') {
      return {
        title: 'Switch support?',
        description:
          "You can support only one counter claim per thread. We'll withdraw your current support before switching.",
        confirmText: 'Switch support',
        cancelText: 'Keep current vote',
      } as const;
    }
    return {
      title: 'Withdraw support?',
      description:
        'You will remove your support from this counter claim. This cannot be undone without re-voting.',
      confirmText: 'Withdraw',
      cancelText: 'Keep support',
    } as const;
  }, [pendingAction]);

  const sentimentSummary = useMemo(
    () => buildSentimentSummary(threadQuery.data?.sentiments),
    [threadQuery.data?.sentiments],
  );

  const hydratedThread = useMemo<ThreadDetailRecord | null>(() => {
    const remoteThread = threadQuery.data;
    if (!remoteThread) {
      return null;
    }

    const counterRedressedCount = counterClaims.filter(
      (claim) => claim.isAccepted,
    ).length;
    const threadSupport = remoteThread.support ?? 0;
    const hasAlert = threadSupport >= REDRESSED_SUPPORT_THRESHOLD;
    const statusOverride = hasAlert
      ? 'Alert Displayed on Page'
      : counterRedressedCount > 0
        ? 'Claim Redressed'
        : 'Open';

    return normalizeThreadDetailRecord({
      thread: remoteThread,
      answers: [],
      counterClaims,
      comments: threadComments,
      sentimentSummary,
      badge: 'Scam & Fraud',
      cpTarget: REDRESSED_SUPPORT_THRESHOLD,
      cpLabel: 'Contribution Points supporting the main claim',
      cpHelper:
        'Cross the threshold to pin the alert across the project surfaces.',
      participation: {
        supportSteps: [],
        counterSteps: [],
      },
      quickActions: [],
      isScam: true,
      statusOverride,
      bodyOverride: [stripHtmlToPlainText(remoteThread.post)],
      highlightsOverride: [
        { label: 'Counter Claims', value: `${counterClaims.length}` },
        { label: 'Redressed', value: `${counterRedressedCount}` },
      ],
      canRetract: canRetractThread,
    });
  }, [
    canRetractThread,
    counterClaims,
    counterClaims.length,
    threadComments.length,
    sentimentSummary,
    threadComments,
    threadQuery.data,
  ]);

  const handleStatusChange = useCallback(
    (value: string) =>
      setActiveTab(value === 'discussion' ? 'discussion' : 'counter'),
    [],
  );

  const handleSortChange = useCallback(
    (value: string) => setSortOption(value === 'new' ? 'new' : 'top'),
    [],
  );

  const handleSentimentChange = useCallback(
    (value: string) =>
      setSentimentFilter((value as 'all' | SentimentKey) ?? 'all'),
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
    try {
      if (hasSupportedThread) {
        await unvoteThreadMutation.mutateAsync({ threadId: numericThreadId });
        addToast({
          title: 'Support withdrawn',
          description: 'Your CP support was withdrawn.',
          color: 'success',
        });
      } else {
        await voteThreadMutation.mutateAsync({ threadId: numericThreadId });
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
    }
  };

  const handleOpenCounterClaimComposer = useCallback(() => {
    if (isThreadRetracted) {
      addToast({
        title: 'Claim already retracted',
        description: 'Counter claims are disabled for retracted alerts.',
        color: 'warning',
      });
      return;
    }
    guardedOpenCounterComposer();
  }, [guardedOpenCounterComposer, isThreadRetracted]);

  const handleOpenThreadCommentClick = useCallback(() => {
    if (isThreadRetracted) {
      addToast({
        title: 'Claim already retracted',
        description: 'Comments are disabled for retracted alerts.',
        color: 'warning',
      });
      return;
    }
    openThreadCommentComposer();
  }, [isThreadRetracted, openThreadCommentComposer]);

  const handlePostCounterComment = useCallback(
    (context: {
      author?: string;
      excerpt?: string;
      timestamp?: string;
      isOp?: boolean;
      target: CommentTarget;
    }) => {
      if (isThreadRetracted) {
        addToast({
          title: 'Claim already retracted',
          description: 'Comments are disabled for retracted alerts.',
          color: 'warning',
        });
        return;
      }
      const target: CommentTarget = context.target ?? {
        targetType: 'thread',
        targetId: numericThreadId,
        threadId: numericThreadId,
      };
      guardedOpenCommentComposer({
        title: 'Commenting to Counter Claim:',
        context: {
          title: 'Commenting to:',
          author: context.author ?? '',
          excerpt: context.excerpt ?? '',
          timestamp: context.timestamp,
          isOp: context.isOp,
          target,
        },
        target,
      });
    },
    [guardedOpenCommentComposer, isThreadRetracted, numericThreadId],
  );

  type ThreadReplyPayload = CommentTarget & {
    author: string;
    excerpt: string;
    timestamp: string;
    isOp: boolean;
  };

  const handleReplyToThreadComment = useCallback(
    (payload: ThreadReplyPayload) => {
      if (isThreadRetracted) {
        addToast({
          title: 'Claim already retracted',
          description: 'Comments are disabled for retracted alerts.',
          color: 'warning',
        });
        return;
      }
      const targetId =
        payload.targetId ?? payload.rootCommentId ?? numericThreadId;
      const targetThreadId = payload.threadId ?? numericThreadId;
      const rootCommentId = payload.rootCommentId ?? payload.targetId;
      guardedOpenCommentComposer({
        title: 'Replying to:',
        context: {
          title: 'Replying to:',
          author: payload.author,
          excerpt: payload.excerpt,
          timestamp: payload.timestamp,
          isOp: payload.isOp,
          target: {
            targetType: payload.targetType ?? 'comment',
            targetId,
            threadId: targetThreadId,
            rootCommentId,
          },
        },
        target: {
          targetType: payload.targetType ?? 'comment',
          targetId,
          threadId: targetThreadId,
          rootCommentId,
        },
      });
    },
    [guardedOpenCommentComposer, isThreadRetracted, numericThreadId],
  );

  const handleSetThreadSentiment = async (sentiment: SentimentKey) => {
    if (!isValidThreadId || !requireAuth()) return;
    try {
      await setThreadSentimentMutation.mutateAsync({
        threadId: numericThreadId,
        type: sentiment,
      });
      threadQuery.refetch();
    } catch (error: any) {
      addToast({
        title: 'Unable to submit sentiment',
        description: error?.message ?? 'Please try again.',
        color: 'danger',
      });
    }
  };

  const handleSetAnswerSentiment = async (
    answerId: number,
    sentiment: SentimentKey,
  ) => {
    if (!isValidThreadId || !requireAuth()) return;
    setAnswerSentimentPendingId(answerId);
    try {
      await setAnswerSentimentMutation.mutateAsync({
        answerId,
        type: sentiment,
      });
      answersQuery.refetch();
    } catch (error: any) {
      addToast({
        title: 'Unable to submit sentiment',
        description: error?.message ?? 'Please try again.',
        color: 'danger',
      });
    } finally {
      setAnswerSentimentPendingId(null);
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

  const counterClaimCount = Math.max(
    threadQuery.data?.answerCount ?? 0,
    counterClaims.length ?? 0,
  );
  const threadCommentCount = threadComments.length;

  const tabItems = useMemo(
    () => [
      {
        key: 'discussion' as const,
        label: 'Discussion',
        count: threadCommentCount,
      },
      {
        key: 'counter' as const,
        label: 'Counter Claims',
        count: counterClaimCount,
      },
    ],
    [counterClaimCount, threadCommentCount],
  );

  const statusTabs = useMemo(() => tabItems.map((tab) => tab.key), [tabItems]);

  const renderStatusLabel = useCallback(
    (value: string) => {
      const tab = tabItems.find((item) => item.key === value);
      return (
        <span className="flex items-center gap-2">
          <span className="text-[14px]  text-black">{tab?.label ?? value}</span>
          <span className="rounded-[4px] px-1 text-[11px] text-black/60">
            {tab?.count ?? 0}
          </span>
        </span>
      );
    },
    [tabItems],
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

  if (!hydratedThread) {
    return (
      <div className="p-10 text-center text-sm text-black/60">
        Thread not found.
      </div>
    );
  }

  const statusTheme = getStatusTheme(hydratedThread.status);

  return (
    <div className="flex flex-col items-center space-y-[20px] px-[20px] pb-16 pt-[20px]">
      <BackHeader className="w-full px-0">
        <Link href="/discourse" className="text-[14px] text-black/70">
          Discourse
        </Link>
        <span className="text-black/25">/</span>
        <span className="text-[14px] text-black/70">Crumb</span>
      </BackHeader>

      <div className="tablet:gap-[20px] mobile:flex-col flex w-full max-w-[1200px] justify-center gap-[40px]">
        <section className="mobile:w-full w-[700px] space-y-[20px]">
          <article className="space-y-[12px]">
            <div className="flex items-center gap-[10px]">
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
              {hydratedThread.status ? (
                <span
                  className={`inline-flex w-fit items-center gap-2 rounded-[4px] border px-[8px] py-[4px] text-[13px] font-semibold ${statusTheme?.border ?? ''} ${statusTheme?.bg ?? ''} ${statusTheme?.text ?? ''}`}
                >
                  {hydratedThread.status}
                </span>
              ) : null}
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
              <SentimentVoteButton
                totalVotes={hydratedThread.totalSentimentVotes}
                value={viewerSentiment}
                isLoading={setThreadSentimentMutation.isPending}
                onSelect={handleSetThreadSentiment}
              />
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
                    onPress={handleOpenCounterClaimComposer}
                    isDisabled={isThreadRetracted}
                    isLoading={createCounterClaimMutation.isPending}
                  >
                    Counter This Claim
                  </Button>
                  <Button
                    className="h-[38px] rounded-[5px] border border-black/10 text-[13px] font-semibold text-black/80"
                    onPress={handleOpenThreadCommentClick}
                    isDisabled={isThreadRetracted}
                    isLoading={createCommentMutation.isPending}
                  >
                    Post Comment In Discussion
                  </Button>
                </>
              )}
            </div>
          </article>

          <TopbarFilters
            statusTabs={statusTabs}
            activeStatus={activeTab}
            onStatusChange={handleStatusChange}
            sortOptions={['top', 'new']}
            activeSort={sortOption}
            onSortChange={handleSortChange}
            sentimentOptions={sentimentFilterOptions}
            selectedSentiment={sentimentFilter}
            onSentimentChange={handleSentimentChange}
            renderStatusLabel={renderStatusLabel}
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
                    threadAuthorName={hydratedThread.author.name}
                    isTopSupport={
                      topCounterSupport > 0 &&
                      claim.cpSupport === topCounterSupport
                    }
                    onSupport={handleSupportClaim}
                    onWithdraw={handleWithdrawClaim}
                    supportPending={supportingClaimId === claim.numericId}
                    withdrawPending={withdrawingClaimId === claim.numericId}
                    sentimentPendingId={answerSentimentPendingId}
                    onSelectSentiment={handleSetAnswerSentiment}
                    onShowSentimentDetail={handleShowAnswerSentimentDetail}
                    onShowSentimentIndicator={handleShowAnswerSentimentDetail}
                    onPostComment={handlePostCounterComment}
                  />
                ))
              ) : isAnswersInitialLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <AnswerDetailCardSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <ScamEmptyState
                  title="No counter claims yet"
                  description="Create a counter claim to contest this alert and gather CP support."
                />
              )
            ) : (
              <>
                {isCommentsInitialLoading ? (
                  <div className="space-y-4 rounded-[12px] border border-black/10 bg-white p-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <ThreadCommentSkeleton key={index} />
                    ))}
                  </div>
                ) : null}
                {filteredComments.length ? (
                  filteredComments.map((comment, index) => (
                    <ThreadCommentTree
                      key={comment.id}
                      node={comment}
                      depth={0}
                      isFirst={index === 0}
                      hasSiblings={filteredComments.length > 1}
                      onReply={handleReplyToThreadComment}
                      threadAuthorName={hydratedThread.author.name}
                      threadId={numericThreadId}
                    />
                  ))
                ) : !isCommentsInitialLoading ? (
                  <ScamEmptyState
                    title="No comments yet"
                    description="Start a discussion to add evidence or confirm remediation."
                  />
                ) : null}
              </>
            )}
          </div>
        </section>

        <aside className="mobile:w-full w-[300px] space-y-[20px]">
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

          <ParticipationCard
            onSupportClaim={handleToggleThreadSupport}
            supportDisabled={
              isThreadRetracted ||
              hasSupportedThread ||
              threadSupportPending ||
              threadWithdrawPending
            }
            supportLoading={threadSupportPending}
            onPostComment={handleOpenThreadCommentClick}
            commentDisabled={isThreadRetracted}
            commentLoading={createCommentMutation.isPending}
            onChallengeClaim={handleOpenCounterClaimComposer}
            challengeDisabled={isThreadRetracted}
            challengeLoading={createCounterClaimMutation.isPending}
          />
        </aside>
      </div>

      <ConfirmModal
        open={Boolean(pendingAction)}
        title={pendingModalCopy?.title ?? ''}
        description={pendingModalCopy?.description ?? ''}
        confirmText={pendingModalCopy?.confirmText}
        cancelText={pendingModalCopy?.cancelText}
        isLoading={pendingActionLoading}
        onConfirm={confirmAction}
        onCancel={cancelAction}
      />

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

      <SentimentModal
        open={Boolean(activeSentimentModal)}
        onClose={() => setActiveSentimentModal(null)}
        title={activeSentimentModal?.title ?? ''}
        excerpt={activeSentimentModal?.excerpt ?? ''}
        sentiments={activeSentimentModal?.sentiments}
        totalVotes={activeSentimentModal?.totalVotes}
      />
    </div>
  );
}
