'use client';

import {
  ArrowSquareOut,
  CaretCircleUp,
  CaretDown,
  ChartBar,
  ShieldWarning,
  UserCircle,
} from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Button } from '@/components/base';
import { trpc } from '@/lib/trpc/client';
import { formatTimeAgo } from '@/lib/utils';
import type { RouterOutputs } from '@/types';

import {
  sentimentDefinitions,
  SentimentKey,
} from '../common/setiment/sentimentConfig';
import { SentimentSummaryPanel } from '../common/setiment/SentimentModal';
import {
  AnswerItem,
  CommentItem,
  QuickAction,
  scamThread,
  threadDataset,
  ThreadDetailRecord,
} from '../common/threadData';
import { ParticipationCard } from '../crumb/ParticipationCard';
import { DiscoursePageLayout } from '../list/DiscoursePageLayout';
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

type ThreadRecord = RouterOutputs['projectDiscussionThread']['getThreadById'];
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'counter' | 'discussion'>(
    'counter',
  );
  const [sortOption, setSortOption] = useState<'top' | 'new'>('top');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | SentimentKey>(
    'all',
  );

  const numericThreadId = Number(threadId);
  const isValidThreadId = Number.isFinite(numericThreadId);

  const fallback = useMemo(
    () => fallbackThread ?? threadDataset[threadId] ?? scamThread,
    [fallbackThread, threadId],
  );

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

  const answers = useMemo<AnswerRecord[]>(() => {
    if (!answersQuery.data?.pages.length) return [];
    return answersQuery.data.pages.flatMap((page) => page.items);
  }, [answersQuery.data]);

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
        author: answer.creator?.name ?? 'Anonymous',
        role: fallback.author.role,
        createdAt: formatTimeAgo(answer.createdAt),
        body: answer.content,
        cpSupport: answer.voteCount ?? 0,
        cpTarget: undefined,
        sentimentLabel: label,
        sentimentVotes: sentiment.totalVotes,
        commentsCount: answer.comments.length,
      } satisfies AnswerItem;
    });
  }, [answers, fallback]);

  const discussionComments = useMemo<CommentItem[]>(() => {
    if (!comments.length) return fallback.comments;
    return comments.map((comment) => ({
      id: String(comment.id),
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
    <DiscoursePageLayout
      title={hydratedThread.title}
      description={hydratedThread.summary}
      breadcrumbs={[
        { label: 'Back', href: '/discourse' },
        { label: 'Discourse', href: '/discourse' },
        { label: 'Scam Thread' },
      ]}
      actions={
        <Button
          className="h-10 rounded-[5px] bg-black px-5 text-[13px] font-semibold text-white hover:bg-black/85"
          onPress={() => router.push('/discourse/create')}
        >
          Create Alert
        </Button>
      }
      sidebar={
        <div className="space-y-5">
          <ContributionVotesCard
            current={fallback.cpProgress.current}
            target={fallback.cpProgress.target}
            label={fallback.cpProgress.label}
            helper={fallback.cpProgress.helper}
            status={hydratedThread.status}
            isScam={hydratedThread.isScam}
          />
          <SentimentSummaryPanel
            title="User Sentiment for this post"
            sentiments={sentimentSummary.metrics.map((metric) => ({
              key: metric.key,
              percentage: metric.percentage,
            }))}
            totalVotes={sentimentSummary.totalVotes}
          />
          <ParticipationCard
            supportSteps={fallback.participation.supportSteps}
            counterSteps={fallback.participation.counterSteps}
            isScam={hydratedThread.isScam}
          />
          <QuickActionsCard actions={fallback.quickActions} />
        </div>
      }
    >
      <section className="space-y-6">
        <ScamThreadHeader thread={hydratedThread} />

        <section className="rounded-[14px] border border-[#e4e0d7] bg-white p-0 shadow-[0px_15px_35px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-4 border-b border-black/10 px-6 pb-4 pt-5 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-6 text-sm font-semibold text-black">
              {tabItems.map((tab) => (
                <Button
                  key={tab.key}
                  type="button"
                  className={`flex items-center gap-2 pb-1 transition ${
                    activeTab === tab.key
                      ? 'border-b-2 border-black text-black'
                      : 'text-black/45'
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                  <span
                    className={`rounded-[4px] px-2 py-0.5 text-[11px] font-bold ${
                      activeTab === tab.key
                        ? 'bg-black text-white'
                        : 'bg-black/5 text-black/50'
                    }`}
                  >
                    {tab.count}
                  </span>
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-black/60">
              <div className="inline-flex items-center rounded-[6px] border border-black/15">
                {(['top', 'new'] as const).map((option) => (
                  <Button
                    key={option}
                    type="button"
                    className={`rounded-[6px] px-4 py-1.5 text-sm font-semibold ${
                      sortOption === option
                        ? 'bg-black text-white'
                        : 'text-black'
                    }`}
                    onClick={() => setSortOption(option)}
                  >
                    {option === 'top' ? 'Top' : 'New'}
                  </Button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-black">
                <div className="relative">
                  <select
                    className="appearance-none rounded-[6px] border border-black/15 bg-white py-1.5 pl-9 pr-6 text-sm font-semibold text-black"
                    value={sentimentFilter}
                    onChange={(event) =>
                      setSentimentFilter(
                        event.target.value as 'all' | SentimentKey,
                      )
                    }
                  >
                    {sentimentFilterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === 'all'
                          ? 'All Sentiment'
                          : sentimentDefinitions[option].label}
                      </option>
                    ))}
                  </select>
                  <ChartBar
                    size={18}
                    className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-black/60"
                  />
                  <CaretDown
                    size={16}
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-black/60"
                  />
                </div>
              </label>
            </div>
          </div>
          <div className="space-y-4 p-6">
            {activeTab === 'counter' ? (
              filteredCounterClaims.length ? (
                filteredCounterClaims.map((claim) => (
                  <CounterClaimCard key={claim.id} claim={claim} />
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
      </section>
    </DiscoursePageLayout>
  );
}

type ScamThreadHeaderProps = {
  thread: ThreadDetailRecord;
};

function ScamThreadHeader({ thread }: ScamThreadHeaderProps) {
  const primaryParagraph = thread.body[0] ?? thread.summary;

  return (
    <article className="rounded-[16px] border border-[#e4e0d7] bg-white p-6 shadow-[0px_10px_25px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/60">
        <span className="inline-flex items-center gap-2 rounded-[6px] border border-[#f8cab9] bg-[#fff2ec] px-3 py-1 text-[#be5329]">
          <ShieldWarning size={16} weight="fill" />
          Scam & Fraud
        </span>
        <span className="inline-flex items-center gap-2 rounded-[6px] border border-black/10 bg-black/5 px-3 py-1 text-black">
          {thread.status}
        </span>
      </div>
      <h1 className="mt-4 text-[22px] font-semibold text-[#202023]">
        {thread.title}
      </h1>
      <p className="mt-2 text-sm text-black/60">{primaryParagraph}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-black/60">
        {thread.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-black/5 px-3 py-1 text-black"
          >
            #{tag}
          </span>
        ))}
      </div>
      <div className="mt-6 grid gap-4 text-sm text-black/70 sm:grid-cols-3">
        {thread.highlights.map((highlight) => (
          <div
            key={highlight.label}
            className="rounded-[10px] border border-dashed border-black/10 bg-black/5 px-4 py-3"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-black/40">
              {highlight.label}
            </p>
            <p className="text-lg font-semibold text-black">
              {highlight.value}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

function CounterClaimCard({ claim }: { claim: AnswerItem }) {
  const sentimentDefinition =
    sentimentDefinitions[claim.sentimentLabel] ??
    sentimentDefinitions.recommend;

  return (
    <article className="rounded-[14px] border border-[#ede8df] bg-white p-6 shadow-[0px_10px_25px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold text-[#202023]">
            {claim.author}
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-black/50">
            {claim.role}
          </p>
          <p className="text-xs text-black/60">{claim.createdAt}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#fff0ee] px-3 py-1 text-xs font-semibold text-[#b53c1d]">
          Counter Claim
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-black/80">{claim.body}</p>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-black/60">
        <span className="inline-flex items-center gap-2 font-semibold text-black">
          <sentimentDefinition.Icon
            size={18}
            weight="fill"
            style={{ color: sentimentDefinition.color }}
          />
          {sentimentDefinition.label}
          <span className="text-black/60">({claim.sentimentVotes} votes)</span>
        </span>
        <div className="ml-auto flex items-center gap-2 text-sm font-semibold text-black">
          <CaretCircleUp size={22} />
          <span>{claim.cpSupport.toLocaleString()} CP</span>
        </div>
      </div>
    </article>
  );
}

function DiscussionCommentCard({ comment }: { comment: CommentItem }) {
  const sentimentDefinition =
    sentimentDefinitions[comment.sentimentLabel] ??
    sentimentDefinitions.recommend;

  return (
    <article className="rounded-[14px] border border-[#ede8df] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold text-black">
            {comment.author}
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-black/50">
            {comment.role}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-black/60">
          <span>{comment.createdAt}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-1 text-black/70">
            <sentimentDefinition.Icon size={14} weight="fill" />
            {sentimentDefinition.label}
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm text-black/80">{comment.body}</p>
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
    <div className="rounded-[16px] border border-dashed border-black/15 bg-white px-6 py-10 text-center text-black/60">
      <CaretCircleUp size={28} className="mx-auto text-black/30" />
      <p className="mt-3 text-sm font-semibold text-black">{title}</p>
      <p className="mt-1 text-sm text-black/60">{description}</p>
    </div>
  );
}

type ContributionVotesCardProps = {
  current: number;
  target: number;
  label: string;
  helper: string;
  status: string;
  isScam: boolean;
};

function ContributionVotesCard({
  current,
  target,
  label,
  helper,
  status,
  isScam,
}: ContributionVotesCardProps) {
  const percentage = Math.min(100, Math.round((current / target) * 100));

  return (
    <div className="rounded-[16px] border border-[#e6dfd5] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between text-sm font-semibold text-black/70">
        <span>{label}</span>
        <span>{status}</span>
      </div>
      <div className="mt-3 h-3 rounded-full bg-black/5">
        <div
          className={`h-full rounded-full ${
            isScam ? 'bg-[#c64b13]' : 'bg-black'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-sm font-semibold text-black">
        <span>{current.toLocaleString()} CP</span>
        <span>{target.toLocaleString()} CP</span>
      </div>
      <p className="mt-1 text-xs text-black/60">{helper}</p>
    </div>
  );
}

type ParticipationCardProps = {
  supportSteps: string[];
  counterSteps: string[];
  isScam: boolean;
};

// function ParticipationCard({
//   supportSteps,
//   counterSteps,
//   isScam,
// }: ParticipationCardProps) {
//   return (
//     <div className="rounded-[16px] border border-[#e6dfd5] bg-white p-5 shadow-sm">
//       <p className="text-sm font-semibold text-black/70">How to participate</p>
//       <div className="mt-4 space-y-4">
//         <div>
//           <div className="flex items-center gap-2 text-[13px] font-semibold text-black">
//             <Lightning size={18} weight="fill" className="text-[#f78f1e]" />
//             {isScam ? 'Support Main Claim' : 'Support Answer'}
//           </div>
//           <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-black/70">
//             {supportSteps.map((step) => (
//               <li key={step}>{step}</li>
//             ))}
//           </ul>
//         </div>
//         <div className="border-t border-dashed border-black/10 pt-4">
//           <div className="flex items-center gap-2 text-[13px] font-semibold text-black">
//             <BookBookmark size={18} weight="fill" className="text-[#4c6ef5]" />
//             {isScam ? 'Create Counter Claim' : 'Join Discussion'}
//           </div>
//           <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-black/70">
//             {counterSteps.map((step) => (
//               <li key={step}>{step}</li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }

type QuickActionsCardProps = {
  actions: QuickAction[];
};

function QuickActionsCard({ actions }: QuickActionsCardProps) {
  if (!actions?.length) return null;
  return (
    <div className="rounded-[16px] border border-[#e6dfd5] bg-white p-5 shadow-sm">
      <p className="text-sm彩票天天 font-semibold text-black/70">
        Quick actions
      </p>
      <div className="mt-4 space-y-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            className="flex w-full items-center gap-3 rounded-[12px] border border-black/10 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:bg-black/5"
          >
            <UserCircle size={20} className="text-black/60" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-black">{action.label}</p>
              <p className="text-xs text-black/60">{action.helper}</p>
            </div>
            <ArrowSquareOut size={16} className="text-black/40" />
          </Button>
        ))}
      </div>
    </div>
  );
}
