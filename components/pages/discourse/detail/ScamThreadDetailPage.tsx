'use client';

import {
  CaretCircleUp,
  CaretCircleUp as CaretCircleUpIcon,
  ChartBar,
  ShieldWarning,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/base';
import { addToast } from '@/components/base/toast';
import { SentimentKey } from '@/components/pages/discourse/common/sentiment/sentimentConfig';
import { SentimentSummaryPanel } from '@/components/pages/discourse/common/sentiment/SentimentModal';
import { TopbarFilters } from '@/components/pages/discourse/common/TopbarFilters';
import BackHeader from '@/components/pages/project/BackHeader';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import { formatTimeAgo } from '@/lib/utils';
import type { RouterOutputs } from '@/types';

import { SentimentIndicator } from '../common/sentiment/SentimentIndicator';
import {
  AnswerItem,
  CommentItem,
  scamThread,
  threadDataset,
  ThreadDetailRecord,
} from '../common/threadData';
import {
  stripHtmlToPlainText,
  summarizeSentiments,
} from '../utils/threadTransforms';

const sentimentFilterOptions: Array<'all' | SentimentKey> = [
  'all',
  'recommend',
  'agree',
  'insightful',
  'provocative',
  'disagree',
];

type AnswerRecord =
  RouterOutputs['projectDiscussionInteraction']['listAnswers']['items'][0];
type ThreadCommentRecord =
  RouterOutputs['projectDiscussionInteraction']['listComments']['items'][0];

type ScamThreadDetailPageProps = {
  threadId: string;
  fallbackThread?: ThreadDetailRecord;
};

export function ScamThreadDetailPage({
  threadId,
  fallbackThread,
}: ScamThreadDetailPageProps) {
  const { isAuthenticated, showAuthPrompt } = useAuth();
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
  const [supportingClaimId, setSupportingClaimId] = useState<number | null>(
    null,
  );
  const [withdrawingClaimId, setWithdrawingClaimId] = useState<number | null>(
    null,
  );

  const numericThreadId = Number(threadId);
  const isValidThreadId = Number.isFinite(numericThreadId);

  const fallback: ThreadDetailRecord = useMemo(
    () => fallbackThread ?? threadDataset[threadId] ?? scamThread,
    [fallbackThread, threadId],
  );

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

  const answers = useMemo<AnswerRecord[]>(() => {
    if (!answersQuery.data?.pages.length) return [];
    return answersQuery.data.pages.flatMap((page) => page.items);
  }, [answersQuery.data]);
  useEffect(() => {
    const viewerHasSupported = (
      threadQuery.data as { viewerHasSupported?: boolean }
    )?.viewerHasSupported;
    setHasSupportedThread(Boolean(viewerHasSupported));
  }, [threadQuery.data]);

  const requireAuth = () => {
    if (isAuthenticated) return true;
    showAuthPrompt();
    return false;
  };

  const comments = useMemo<ThreadCommentRecord[]>(() => {
    if (!commentsQuery.data?.pages.length) return [];
    return commentsQuery.data.pages.flatMap((page) => page.items);
  }, [commentsQuery.data]);

  const counterClaims = useMemo<AnswerItem[]>(() => {
    if (!answers.length) return fallback.counterClaims ?? [];

    return answers.map((answer) => {
      const sentiment = summarizeSentiments(answer.sentiments);
      const label = sentiment.dominantKey ?? 'recommend';

      return {
        id: String(answer.id),
        numericId: answer.id,
        author: answer.creator?.name ?? 'Anonymous',
        role: fallback.author.role,
        createdAt: formatTimeAgo(answer.createdAt),
        body: answer.content,
        cpSupport: (answer as { support?: number }).support ?? 0,
        cpTarget: undefined,
        sentimentLabel: label,
        sentimentVotes: sentiment.totalVotes,
        commentsCount: answer.comments.length,
        comments: [],
        viewerSentiment: undefined,
        viewerHasSupported: Boolean(answer.viewerHasSupported),
      } satisfies AnswerItem;
    });
  }, [answers, fallback]);

  const discussionComments = useMemo<CommentItem[]>(() => {
    if (!comments.length) return fallback.comments;
    return comments.map((comment) => ({
      id: String(comment.id),
      numericId: comment.id,
      answerId: comment.answerId ?? undefined,
      author: comment.creator?.name ?? 'Anonymous',
      role: fallback.author.role,
      createdAt: formatTimeAgo(comment.createdAt),
      body: comment.content,
      sentimentLabel: 'recommend',
    }));
  }, [comments, fallback]);

  const sentimentSummary = useMemo(() => {
    if (!threadQuery.data) {
      return {
        metrics: fallback.sentiment,
        totalVotes: fallback.totalSentimentVotes,
      };
    }

    const summary = summarizeSentiments(threadQuery.data.sentiments);
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
  }, [fallback.sentiment, fallback.totalSentimentVotes, threadQuery.data]);

  const hydratedThread = useMemo<ThreadDetailRecord>(() => {
    if (!threadQuery.data) {
      return {
        ...fallback,
        counterClaims,
        comments: discussionComments,
      };
    }

    const remoteThread = threadQuery.data;
    const summary = summarizeSentiments(remoteThread.sentiments);

    return {
      ...fallback,
      id: String(remoteThread.id),
      title: remoteThread.title,
      summary: stripHtmlToPlainText(remoteThread.post) || fallback.summary,
      cpProgress: {
        ...fallback.cpProgress,
        current: remoteThread.support ?? fallback.cpProgress.current,
      },
      categories:
        remoteThread.category && remoteThread.category.length
          ? remoteThread.category
          : fallback.categories,
      tags:
        remoteThread.tags && remoteThread.tags.length
          ? remoteThread.tags
          : fallback.tags,
      sentiment: summary.metrics.map((metric) => ({
        key: metric.key,
        percentage: metric.percentage,
        votes: Math.round(
          (metric.percentage / 100) * (summary.totalVotes || 0),
        ),
      })),
      totalSentimentVotes: summary.totalVotes,
      counterClaims,
      comments: discussionComments,
      author: {
        ...fallback.author,
        name: remoteThread.creator?.name ?? fallback.author.name,
        postedAt: formatTimeAgo(remoteThread.createdAt),
      },
    };
  }, [counterClaims, discussionComments, fallback, threadQuery.data]);

  const filteredCounterClaims = useMemo(() => {
    if (sentimentFilter === 'all') {
      return hydratedThread.counterClaims ?? [];
    }
    return (hydratedThread.counterClaims ?? []).filter(
      (claim) => claim.sentimentLabel === sentimentFilter,
    );
  }, [hydratedThread.counterClaims, sentimentFilter]);

  const filteredComments = useMemo(() => {
    if (sentimentFilter === 'all') {
      return hydratedThread.comments;
    }
    return hydratedThread.comments.filter(
      (comment) => comment.sentimentLabel === sentimentFilter,
    );
  }, [hydratedThread.comments, sentimentFilter]);

  const handleToggleThreadSupport = async () => {
    if (!isValidThreadId || !requireAuth()) {
      return;
    }
    const action = hasSupportedThread ? 'withdraw' : 'support';
    hasSupportedThread
      ? setThreadWithdrawPending(true)
      : setThreadSupportPending(true);
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

  const handleSupportClaim = async (answerId: number) => {
    if (!requireAuth()) return;

    const existing = answers.find((item) => item.viewerHasSupported);
    if (existing?.id === answerId) {
      await handleWithdrawClaim(answerId);
      return;
    }

    if (existing && existing.id !== answerId) {
      setWithdrawingClaimId(existing.id);
      try {
        await unvoteAnswerMutation.mutateAsync({ answerId: existing.id });
      } catch {
        setWithdrawingClaimId(null);
        return;
      }
      setWithdrawingClaimId(null);
    }

    setSupportingClaimId(answerId);
    try {
      await voteAnswerMutation.mutateAsync({ answerId });
      addToast({
        title: 'Supported counter claim',
        description: 'CP support registered successfully.',
        color: 'success',
      });
      answersQuery.refetch();
    } catch (error: any) {
      addToast({
        title: 'Unable to support',
        description: error?.message ?? 'Please try again.',
        color: 'danger',
      });
    } finally {
      setSupportingClaimId(null);
      utils.projectDiscussionThread.listThreads.invalidate();
    }
  };

  const handleWithdrawClaim = async (answerId: number) => {
    if (!requireAuth()) return;

    setWithdrawingClaimId(answerId);
    try {
      await unvoteAnswerMutation.mutateAsync({ answerId });
      addToast({
        title: 'Support withdrawn',
        description: 'Your CP support was withdrawn.',
        color: 'success',
      });
      answersQuery.refetch();
    } catch (error: any) {
      addToast({
        title: 'Unable to withdraw',
        description: error?.message ?? 'Please try again.',
        color: 'danger',
      });
    } finally {
      setWithdrawingClaimId(null);
      utils.projectDiscussionThread.listThreads.invalidate();
    }
  };

  const tabItems = [
    {
      key: 'discussion' as const,
      label: 'Discussion',
      count: hydratedThread.comments.length,
    },
    {
      key: 'counter' as const,
      label: 'Counter Claims',
      count: hydratedThread.counterClaims?.length ?? 0,
    },
  ];

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
                <span className="size-[24px] rounded-full bg-[#D9D9D9]" />
                <span className="text-[14px]">
                  {hydratedThread.author.name}
                </span>
              </div>
              <span className="text-black/60">
                {hydratedThread.author.postedAt}
              </span>
            </div>
            <p className="text-[16px] leading-[20px] text-black/80">
              {renderSummaryWithLinks(hydratedThread.summary)}
            </p>
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
              className={`h-[38px] w-full border-none gap-[10px] rounded-[8px] bg-[#EBEBEB] text-black`}
              isDisabled={threadSupportPending || threadWithdrawPending}
              isLoading={threadSupportPending || threadWithdrawPending}
              onPress={handleToggleThreadSupport}
            >
              <CaretCircleUp
                size={30}
                weight="fill"
                className={hasSupportedThread ? 'text-black/30' : 'text-black/10'}
              />
              <span
                className={`font-inter leading-1 text-[14px] font-[500] `}
              >
                Support This Claim
              </span>
              <span
                className={`leading-1 text-[12px] font-[400] `}
              >
                {hydratedThread.cpProgress.current} /{' '}
                {hydratedThread.cpProgress.target}
              </span>
            </Button>
            <div className="mt-[20px] flex flex-col gap-[10px] border-t border-black/10 pt-[10px]">
              {/* TODO：跟 create answer 是一样的，创建一条新的 claim */}
              <Button className="h-[38px] rounded-[5px] bg-[#222222] text-[13px] font-semibold text-white hover:bg-black/85">
                Counter This Claim
              </Button>
              {/* TODO: create comment */}
              <Button className="h-[38px] rounded-[5px] border border-black/10 text-[13px] font-semibold text-black/80">
                Post Comment
              </Button>
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
                    onSupport={handleSupportClaim}
                    onWithdraw={handleWithdrawClaim}
                    supportPending={supportingClaimId === claim.numericId}
                    withdrawPending={withdrawingClaimId === claim.numericId}
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
          <ContributionVotesCompact
            current={hydratedThread.cpProgress.current}
            label="Contribution Point Votes"
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

          <ParticipateCard />
        </aside>
      </div>
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

type SupportBarProps = {
  current: number;
  target: number;
  label: string;
};

function SupportBar({ current, target, label }: SupportBarProps) {
  const progress = Math.min(100, Math.round((current / target) * 100));

  return (
    <div className="flex items-center gap-[10px] rounded-[8px] border border-black/10 bg-[#ebebeb] px-[10px] py-[8px]">
      <CaretCircleUpIcon size={26} weight="fill" className="text-black/30" />
      <div className="flex-1">
        <p className="text-center text-[14px] font-semibold text-black/70">
          {label}
        </p>
        <div className="mt-[6px] h-[10px] overflow-hidden rounded-full bg-white/60">
          <div
            className="h-full rounded-full bg-black/25"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <span className="text-[12px] font-semibold text-black/60">
        {current.toLocaleString()} / {target.toLocaleString()}
      </span>
    </div>
  );
}

type CounterClaimCardProps = {
  claim: AnswerItem;
  cpTarget?: number;
  onSupport: (answerId: number) => void;
  onWithdraw: (answerId: number) => void;
  supportPending?: boolean;
  withdrawPending?: boolean;
};

function CounterClaimCard({
  claim,
  cpTarget,
  onSupport,
  onWithdraw,
  supportPending = false,
  withdrawPending = false,
}: CounterClaimCardProps) {
  const commentsCount = claim.commentsCount ?? claim.comments?.length ?? 0;
  const progress =
    cpTarget && cpTarget > 0
      ? Math.min(100, Math.round((claim.cpSupport / cpTarget) * 100))
      : undefined;
  const CP_SUPPORT_THRESHOLD = cpTarget ?? 9000;
  const meetsThreshold = claim.cpSupport >= CP_SUPPORT_THRESHOLD;
  const textColor = meetsThreshold
    ? 'text-[#64C0A5]'
    : claim.viewerHasSupported
      ? 'text-black'
      : 'text-black/60';
  const iconColor = meetsThreshold
    ? 'text-[#64C0A5]'
    : claim.viewerHasSupported
      ? 'text-black/30'
      : 'text-black/10';

  return (
    <article className="rounded-[10px] border border-black/10 bg-white p-[10px]">
      <div className="flex gap-3">
        {/* TODO user avatar */}

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center  gap-2">
            <div className="flex size-[32px] items-center justify-center rounded-full bg-[#d9d9d9]" />
            <p className="text-[15px] font-semibold text-black">
              {claim.author}
            </p>
            <SentimentIndicator />
          </div>
          {/* TODO 用 MdEditor */}
          <p className="text-[14px] leading-[20px] text-black/80">
            {claim.body}
          </p>

          <p className="text-[12px] text-black/60">{claim.createdAt}</p>

          <Button
            className={`h-[38px] w-full gap-3 rounded-[8px] px-[10px] ${
              meetsThreshold
                ? 'bg-[#F0FFF9]'
                : claim.viewerHasSupported
                  ? 'bg-black text-white'
                  : 'bg-[#f5f5f5]'
            }`}
            isDisabled={supportPending || withdrawPending}
            isLoading={supportPending || withdrawPending}
            onPress={() =>
              claim.viewerHasSupported
                ? onWithdraw(claim.numericId)
                : onSupport(claim.numericId)
            }
          >
            <CaretCircleUpIcon
              weight="fill"
              size={30}
              className={iconColor}
            />
            <div className="font-mona flex gap-[5px] text-[13px] font-[500] text-black/50">
              <span
                className={`text-[13px] font-semibold ${textColor}`}
              >
                {claim.cpSupport.toLocaleString()}
              </span>
              <span>/</span>
              <span>{cpTarget ?? 0}</span>
            </div>
          </Button>

          <div className="flex items-center justify-between border-t border-black/10 pt-[10px] text-[13px] font-semibold text-black/80">
            <div className="flex items-center gap-2">
              <span>Comments</span>
              <span className="text-black/50">
                {String(commentsCount).padStart(2, '0')}
              </span>
            </div>
            <Button className="h-[30px] rounded-[5px] border border-black/10 px-[10px] text-[12px] font-semibold text-black/80">
              Post Comment
            </Button>
          </div>
        </div>
      </div>

      {claim.comments?.length ? (
        <div className="mt-3 space-y-2 rounded-[8px] border border-black/10 bg-[#f7f7f7] p-[10px]">
          {claim.comments.slice(0, 1).map((comment) => (
            <div key={comment.id} className="space-y-1">
              <p className="text-[13px] font-semibold text-black">
                {comment.author}
              </p>
              <p className="text-[13px] text-black/70">{comment.body}</p>
              <span className="text-[12px] text-black/50">
                {comment.createdAt}
              </span>
            </div>
          ))}
          {commentsCount > claim.comments.length ? (
            <div className="flex justify-start">
              <Button className="h-[30px] rounded-[5px] border border-black/10 px-[10px] text-[12px] font-semibold text-black/80">
                View All Comments
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function DiscussionCommentCard({ comment }: { comment: CommentItem }) {
  return (
    <article className="rounded-[10px] border border-black/10 bg-white p-[10px]">
      <div className="flex gap-3">
        <div className="flex size-[28px] items-center justify-center rounded-full bg-[#d9d9d9]" />
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-black">
                {comment.author}
              </span>
              <span className="text-[12px] text-black/60">
                {comment.createdAt}
              </span>
            </div>
            <SentimentIndicator />
          </div>
          <p className="text-[14px] leading-[20px] text-black/80">
            {comment.body}
          </p>
        </div>
      </div>
    </article>
  );
}

function ScamEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[10px] border border-dashed border-black/15 bg-white px-6 py-8 text-center text-black/60">
      <CaretCircleUp size={24} className="mx-auto text-black/30" />
      <p className="mt-3 text-[13px] font-semibold text-black">{title}</p>
      <p className="mt-1 text-[13px] text-black/60">{description}</p>
    </div>
  );
}

type ContributionVotesCompactProps = {
  current: number;
  label: string;
};

function ContributionVotesCompact({
  current,
  label,
}: ContributionVotesCompactProps) {
  return (
    <section className="rounded-[10px] border border-black/10 bg-white p-[14px] shadow-sm">
      <header className="flex items-center gap-[10px] text-[14px] font-semibold text-black/80">
        <CaretCircleUpIcon size={20} weight="fill" className="text-black/60" />
        <span className="leading-[1.2]">{label}</span>
      </header>
      <p className="mt-[6px] text-[18px] font-semibold leading-none text-black/60">
        {current.toLocaleString()}
      </p>
    </section>
  );
}

function ParticipateCard() {
  return (
    <section className="rounded-[10px] border border-black/10 bg-white p-[14px] shadow-sm">
      <h3 className="text-[14px] font-semibold text-black">
        How to participate?
      </h3>
      <div className="mt-[10px] space-y-[10px] text-[13px] leading-[1.35] text-black/60">
        <div className="space-y-[6px]">
          <p className="text-[12px] font-semibold text-black/80">
            Support Main Claim:
          </p>
          <p>
            You can support this post as a scam by voting with your Contribution
            Points (CP) under this post. Once the Scam Acceptance Threshold is
            reached, it will display a label on the project page.
          </p>
          <div className="flex flex-col gap-[6px]">
            <Button className="h-[30px] rounded-[5px] border border-black/10 text-[13px] font-normal text-[#222222]">
              Support Claim
            </Button>
            <Button className="h-[30px] rounded-[5px] border border-black/10 text-[13px] font-normal text-[#222222]">
              Post a Comment
            </Button>
          </div>
        </div>
        <div className="space-y-[6px]">
          <p className="text-[12px] font-semibold text-black/80">
            Counter Claim:
          </p>
          <p>
            If you disagree with this post, you can either create a counter
            claim and gather support from the community or you can vote for any
            existing counter claims
          </p>
          <Button className="h-[30px] w-full rounded-[5px] border border-black/10 text-[13px] font-normal text-[#222222]">
            Challenge Claim
          </Button>
        </div>
      </div>
    </section>
  );
}
