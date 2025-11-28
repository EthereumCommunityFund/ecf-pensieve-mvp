'use client';

import {
  ArrowSquareOut,
  BookBookmark,
  ChatCenteredDots,
  CheckCircle,
  Lightning,
  ShieldWarning,
  UserCircle,
} from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { DiscoursePageLayout } from './DiscoursePageLayout';
import { SentimentIndicator } from './SentimentIndicator';
import {
  defaultSentimentDisplay,
  sentimentDefinitions,
  SentimentKey,
  SentimentMetric,
} from './sentimentConfig';
import {
  AnswerItem,
  CommentItem,
  DetailedSentimentMetric,
  generalThread,
  QuickAction,
  threadDataset,
} from './threadData';

type ThreadDetailPageProps = {
  threadId: string;
};

export function ThreadDetailPage({ threadId }: ThreadDetailPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'answers' | 'comments'>('answers');
  const [sortOption, setSortOption] = useState<'top' | 'new'>('top');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');

  const thread = useMemo(
    () => threadDataset[threadId] ?? generalThread,
    [threadId],
  );

  const answersToRender = thread.isScam
    ? (thread.counterClaims ?? [])
    : thread.answers;
  const tabOptions = thread.isScam
    ? [
        { key: 'answers', label: 'Counter Claims' },
        { key: 'comments', label: 'Discussion' },
      ]
    : [
        { key: 'answers', label: 'Answers' },
        { key: 'comments', label: 'Comments' },
      ];

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
    <DiscoursePageLayout
      title={thread.title}
      description={thread.summary}
      breadcrumbs={[
        { label: 'Back', href: '/discourse' },
        { label: 'Discourse', href: '/discourse' },
        { label: 'Thread' },
      ]}
      actions={
        <>
          <button
            className="h-10 rounded-[5px] bg-black px-5 text-[13px] font-semibold text-white hover:bg-black/85"
            onClick={() => router.push('/discourse/create')}
          >
            Create a Thread
          </button>
          <button className="h-10 rounded-[5px] border border-black/80 bg-white px-5 text-[13px] font-semibold text-black hover:bg-black/5">
            Leaderboard
          </button>
        </>
      }
      sidebar={
        <div className="space-y-5">
          <ContributionVotesCard
            current={thread.cpProgress.current}
            target={thread.cpProgress.target}
            label={thread.cpProgress.label}
            helper={thread.cpProgress.helper}
            status={thread.status}
            isScam={thread.isScam}
          />
          <SentimentSummaryCard
            sentiments={thread.sentiment}
            totalVotes={thread.totalSentimentVotes}
          />
          <ParticipationCard
            supportSteps={thread.participation.supportSteps}
            counterSteps={thread.participation.counterSteps}
            isScam={thread.isScam}
          />
          <QuickActionsCard actions={thread.quickActions} />
        </div>
      }
    >
      <section className="space-y-6">
        <article className="rounded-[16px] border border-[#e7e4df] bg-white p-6 shadow-[0px_15px_35px_rgba(15,23,42,0.05)]">
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/70">
            <span className="inline-flex items-center gap-1 rounded-[5px] border border-black/10 bg-[#f9f7f2] px-3 py-1 text-black">
              {thread.badge}
            </span>
            <span className="inline-flex items-center gap-1 rounded-[5px] border border-black/10 bg-[#f5f5f5] px-3 py-1 text-black">
              {thread.status}
            </span>
            {thread.isScam ? (
              <span className="inline-flex items-center gap-2 rounded-[5px] border border-[#f8cab9] bg-[#fff2ec] px-3 py-1 text-[#be5329]">
                <ShieldWarning size={16} weight="fill" />
                Scam Alert
              </span>
            ) : null}
          </div>
          <div className="mt-4 flex flex-col gap-4 border-t border-dashed border-black/10 pt-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-black/5 text-lg font-semibold text-black/70">
                {thread.author.avatarFallback}
              </span>
              <div>
                <p className="text-[15px] font-semibold text-[#202023]">
                  {thread.author.name}
                  <span className="ml-2 text-sm text-black/50">
                    ({thread.author.role})
                  </span>
                </p>
                <p className="text-sm text-black/60">{thread.author.handle}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-black/50">
                  {thread.author.postedAt}
                  {thread.author.editedAt ? ` / ${thread.author.editedAt}` : ''}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-black/60">
              {thread.categories.map((category) => (
                <span
                  key={category}
                  className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-black"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-[16px] border border-[#ebe4dc] bg-white p-6 shadow-[0px_12px_30px_rgba(15,23,42,0.04)]">
          <div className="space-y-4 text-[15px] leading-[1.6] text-black/80">
            {thread.body.map((paragraph, index) => (
              <p key={`${thread.id}-body-${index}`}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {thread.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-black/5 px-4 py-1 text-[13px] font-semibold text-black/70"
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
                <p className="text-xs uppercase tracking-[0.15em] text-black/50">
                  {highlight.label}
                </p>
                <p className="mt-2 text-lg font-semibold text-black">
                  {highlight.value}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[16px] border border-[#ebe4dc] bg-white p-6 shadow-[0px_12px_30px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap items-center gap-3">
            <button className="h-11 rounded-full bg-black px-6 text-[14px] font-semibold text-white transition hover:bg-black/85">
              {thread.isScam ? 'Support This Claim' : 'Answer This Question'}
            </button>
            <button className="h-11 rounded-full border border-black/15 px-5 text-[14px] font-semibold text-black transition hover:bg-black/5">
              {thread.isScam ? 'Counter This Claim' : 'Post Comment'}
            </button>
            <button className="inline-flex h-11 items-center gap-2 rounded-full border border-black/15 px-5 text-[13px] font-semibold text-black/70 hover:bg-black/5">
              <ArrowSquareOut size={18} />
              Share thread
            </button>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-black/60">
                {thread.cpProgress.label}
              </p>
              <div className="mt-3 h-3 rounded-full bg-black/5">
                <div
                  className="h-full rounded-full bg-black"
                  style={{ width: `${cpPercent}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm font-semibold text-black/80">
                <span>{thread.cpProgress.current.toLocaleString()} CP</span>
                <span>{thread.cpProgress.target.toLocaleString()} CP</span>
              </div>
              <p className="mt-1 text-xs text-black/60">
                {thread.cpProgress.helper}
              </p>
            </div>
            <div className="rounded-[14px] border border-black/10 bg-[#f9f7f2] p-4">
              <div className="flex items-center justify-between text-sm font-semibold text-black/70">
                <span>User Sentiment</span>
                <span>{thread.totalSentimentVotes} votes</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <SentimentIndicator sentiments={sentimentMetrics} />
                <div className="text-xs text-black/60">
                  <p>
                    Filter by sentiment:{' '}
                    <span className="font-semibold text-black">
                      {sentimentFilter === 'all'
                        ? 'All'
                        : sentimentDefinitions[sentimentFilter as SentimentKey]
                            ?.label || 'All'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>

        <section className="rounded-[18px] border border-[#e8e1d5] bg-white p-6 shadow-[0px_15px_35px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-4 border-b border-black/10 pb-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3">
              {tabOptions.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`rounded-full px-5 py-2 text-sm font-semibold ${
                    activeTab === tab.key
                      ? 'bg-black text-white'
                      : 'bg-black/5 text-black'
                  }`}
                  onClick={() =>
                    setActiveTab(tab.key as 'answers' | 'comments')
                  }
                >
                  {tab.label}
                  {tab.key === 'answers' && thread.isScam ? (
                    <span className="ml-2 rounded-full bg-white/30 px-2 py-0.5 text-xs">
                      {thread.counterClaims?.length ?? 0}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-black/60">
              <div className="flex gap-2">
                {(['top', 'new'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`rounded-full border px-4 py-1.5 ${
                      sortOption === option
                        ? 'border-black bg-black text-white'
                        : 'border-black/15 text-black'
                    }`}
                    onClick={() => setSortOption(option)}
                  >
                    {option === 'top' ? 'Top' : 'New'}
                  </button>
                ))}
              </div>
              <label className="text-xs uppercase tracking-[0.2em] text-black/40">
                Sentiment
                <select
                  className="ml-2 rounded-full border border-black/15 bg-white px-3 py-1 text-sm text-black"
                  value={sentimentFilter}
                  onChange={(event) => setSentimentFilter(event.target.value)}
                >
                  <option value="all">All</option>
                  {Object.entries(sentimentDefinitions).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {activeTab === 'answers' ? (
              answersToRender.length ? (
                answersToRender.map((answer) => (
                  <AnswerCard
                    key={answer.id}
                    answer={answer}
                    isScam={thread.isScam}
                  />
                ))
              ) : (
                <EmptyState
                  title={
                    thread.isScam
                      ? 'No counter claims yet'
                      : 'No answers have been submitted'
                  }
                  description="Be the first to submit evidence, propose a fix, or request moderator review."
                />
              )
            ) : thread.comments.length ? (
              thread.comments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))
            ) : (
              <EmptyState
                title="No comments yet"
                description="Start a discussion to share additional context."
              />
            )}
          </div>
        </section>
      </section>
    </DiscoursePageLayout>
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

export function ContributionVotesCard({
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

type SentimentSummaryCardProps = {
  sentiments: DetailedSentimentMetric[];
  totalVotes: number;
};

export function SentimentSummaryCard({
  sentiments,
  totalVotes,
}: SentimentSummaryCardProps) {
  return (
    <div className="rounded-[16px] border border-[#e6dfd5] bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-black/70">
        User Sentiment for this post
      </p>
      <p className="text-xs uppercase tracking-[0.2em] text-black/40">
        {totalVotes} votes
      </p>
      <div className="mt-4 space-y-3">
        {sentiments.map((sentiment) => {
          const definition =
            sentimentDefinitions[sentiment.key] || defaultSentimentDisplay;
          return (
            <div key={`${sentiment.key}-${sentiment.votes}`}>
              <div className="flex items-center justify-between text-sm text-black/70">
                <div className="flex items-center gap-2">
                  <definition.Icon
                    size={18}
                    weight="fill"
                    style={{ color: definition.color }}
                  />
                  <span>{definition.label}</span>
                </div>
                <span className="font-semibold text-black">
                  {sentiment.votes} ({sentiment.percentage}%)
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-black/5">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, sentiment.percentage)}%`,
                    backgroundColor: definition.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type ParticipationCardProps = {
  supportSteps: string[];
  counterSteps: string[];
  isScam: boolean;
};

export function ParticipationCard({
  supportSteps,
  counterSteps,
  isScam,
}: ParticipationCardProps) {
  return (
    <div className="rounded-[16px] border border-[#e6dfd5] bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-black/70">How to participate</p>
      <div className="mt-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 text-[13px] font-semibold text-black">
            <Lightning size={18} weight="fill" className="text-[#f78f1e]" />
            {isScam ? 'Support Main Claim' : 'Support Answer'}
          </div>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-black/70">
            {supportSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
        <div className="border-t border-dashed border-black/10 pt-4">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-black">
            <BookBookmark size={18} weight="fill" className="text-[#4c6ef5]" />
            {isScam ? 'Counter Claim' : 'Add Discussion'}
          </div>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-black/70">
            {counterSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

type QuickActionsCardProps = {
  actions: QuickAction[];
};

export function QuickActionsCard({ actions }: QuickActionsCardProps) {
  return (
    <div className="rounded-[16px] border border-[#e6dfd5] bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-black/70">Quick actions</p>
      <div className="mt-4 space-y-3">
        {actions.map((action) => (
          <button
            key={action.label}
            className="flex w-full items-center gap-3 rounded-[12px] border border-black/10 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:bg-black/5"
          >
            <UserCircle size={20} className="text-black/60" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-black">{action.label}</p>
              <p className="text-xs text-black/60">{action.helper}</p>
            </div>
            <ArrowSquareOut size={16} className="text-black/40" />
          </button>
        ))}
      </div>
    </div>
  );
}

type AnswerCardProps = {
  answer: AnswerItem;
  isScam: boolean;
};

export function AnswerCard({ answer, isScam }: AnswerCardProps) {
  const sentimentDefinition =
    sentimentDefinitions[answer.sentimentLabel] || defaultSentimentDisplay;
  const progress =
    answer.cpTarget && answer.cpTarget > 0
      ? Math.min(100, Math.round((answer.cpSupport / answer.cpTarget) * 100))
      : undefined;

  return (
    <article className="rounded-[16px] border border-black/10 bg-white p-5 shadow-[0_12px_25px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-black/5 text-sm font-semibold text-black/70">
            {answer.author[0]}
          </div>
          <div>
            <p className="text-[15px] font-semibold text-black">
              {answer.author}
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-black/50">
              {answer.role}
            </p>
            <p className="text-xs text-black/60">{answer.createdAt}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-black/70">
          {answer.isAccepted ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e2f7ef] px-3 py-1 text-[#1c9e70]">
              <CheckCircle size={16} weight="fill" />
              Accepted Answer
            </span>
          ) : null}
          {answer.statusTag ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fff3e6] px-3 py-1 text-[#c46a1d]">
              {answer.statusTag}
            </span>
          ) : null}
          {isScam ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fff0ee] px-3 py-1 text-[#b53c1d]">
              Counter Claim
            </span>
          ) : null}
        </div>
      </div>
      <p className="mt-4 text-[15px] leading-relaxed text-black/80">
        {answer.body}
      </p>
      <div className="mt-4 space-y-2 rounded-[12px] bg-black/5 px-4 py-3 text-sm text-black/70">
        <p className="font-semibold">
          CP Support:{' '}
          <span className="text-black">
            {answer.cpSupport.toLocaleString()} CP
          </span>
          {answer.cpTarget ? (
            <span className="text-black/50">
              {' '}
              / {answer.cpTarget.toLocaleString()} CP
            </span>
          ) : null}
        </p>
        {progress !== undefined ? (
          <div className="h-2 rounded-full bg-white/40">
            <div
              className="h-full rounded-full bg-black/70"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-black/60">
        <span className="inline-flex items-center gap-2 font-semibold text-black">
          <sentimentDefinition.Icon
            size={18}
            weight="fill"
            style={{ color: sentimentDefinition.color }}
          />
          {sentimentDefinition.label}
          <span className="text-black/60">({answer.sentimentVotes} votes)</span>
        </span>
        <button className="text-sm font-semibold text-black hover:underline">
          View {answer.commentsCount} comments
        </button>
        <div className="ml-auto flex flex-wrap gap-2">
          <button className="rounded-full border border-black/15 px-4 py-1.5 text-sm font-semibold text-black">
            Upvote CP
          </button>
          <button className="rounded-full border border-black/15 px-4 py-1.5 text-sm font-semibold text-black">
            Add Comment
          </button>
        </div>
      </div>
    </article>
  );
}

type CommentCardProps = {
  comment: CommentItem;
};

export function CommentCard({ comment }: CommentCardProps) {
  const sentimentDefinition =
    sentimentDefinitions[comment.sentimentLabel] || defaultSentimentDisplay;

  return (
    <article className="rounded-[16px] border border-black/10 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-black/5 text-sm font-semibold text-black/70">
            {comment.author[0]}
          </div>
          <div>
            <p className="text-[15px] font-semibold text-black">
              {comment.author}
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-black/50">
              {comment.role}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-black/60">
          <span>{comment.createdAt}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-1 text-black/70">
            <sentimentDefinition.Icon
              size={14}
              weight="fill"
              style={{ color: sentimentDefinition.color }}
            />
            {sentimentDefinition.label}
          </span>
        </div>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-black/80">
        {comment.body}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-black/60">
        <button className="rounded-full border border-black/15 px-4 py-1.5 font-semibold text-black">
          React
        </button>
        <button className="rounded-full border border-black/15 px-4 py-1.5 font-semibold text-black">
          Reply
        </button>
      </div>
    </article>
  );
}

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[16px] border border-dashed border-black/15 bg-white px-6 py-10 text-center text-black/60">
      <ChatCenteredDots size={28} className="mx-auto text-black/30" />
      <p className="mt-3 text-sm font-semibold text-black">{title}</p>
      <p className="mt-1 text-sm text-black/60">{description}</p>
    </div>
  );
}
