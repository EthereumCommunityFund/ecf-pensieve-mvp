'use client';

import {
  CaretCircleUp,
  CaretDown,
  ChartBar,
  ShieldWarning,
} from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Button } from '@/components/base';

import { DiscoursePageLayout } from './DiscoursePageLayout';
import {
  ContributionVotesCard,
  ParticipationCard,
  QuickActionsCard,
  SentimentSummaryCard,
} from './ThreadDetailPage';
import { sentimentDefinitions, SentimentKey } from './sentimentConfig';
import {
  AnswerItem,
  CommentItem,
  scamThread,
  threadDataset,
  ThreadDetailRecord,
} from './threadData';

type ScamThreadDetailPageProps = {
  threadId: string;
};

export function ScamThreadDetailPage({ threadId }: ScamThreadDetailPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'counter' | 'discussion'>(
    'counter',
  );
  const [sortOption, setSortOption] = useState<'top' | 'new'>('top');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | SentimentKey>(
    'all',
  );

  const thread: ThreadDetailRecord = useMemo(() => {
    const record = threadDataset[threadId];
    if (record?.isScam) return record;
    return scamThread;
  }, [threadId]);

  const counterClaims = useMemo(() => {
    if (sentimentFilter === 'all') {
      return thread.counterClaims ?? [];
    }
    return (thread.counterClaims ?? []).filter(
      (claim) => claim.sentimentLabel === sentimentFilter,
    );
  }, [sentimentFilter, thread.counterClaims]);

  const discussionComments = useMemo(() => {
    if (sentimentFilter === 'all') {
      return thread.comments;
    }
    return thread.comments.filter(
      (comment) => comment.sentimentLabel === sentimentFilter,
    );
  }, [sentimentFilter, thread.comments]);

  const tabItems = [
    {
      key: 'discussion' as const,
      label: 'Discussion',
      count: thread.comments.length,
    },
    {
      key: 'counter' as const,
      label: 'Counter Claims',
      count: thread.counterClaims?.length ?? 0,
    },
  ];

  return (
    <DiscoursePageLayout
      title={thread.title}
      description={thread.summary}
      breadcrumbs={[
        { label: 'Back', href: '/discourse' },
        { label: 'Discourse', href: '/discourse' },
        { label: 'Scam Thread' },
      ]}
      actions={
        <button
          className="h-10 rounded-[5px] bg-black px-5 text-[13px] font-semibold text-white hover:bg-black/85"
          onClick={() => router.push('/discourse/create')}
        >
          Create Alert
        </button>
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
        <ScamThreadHeader thread={thread} />

        <section className="rounded-[14px] border border-[#e4e0d7] bg-white p-0 shadow-[0px_15px_35px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-4 border-b border-black/10 px-6 pb-4 pt-5 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-6 text-sm font-semibold text-black">
              {tabItems.map((tab) => (
                <button
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
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-black/60">
              <div className="inline-flex items-center rounded-[6px] border border-black/15">
                {(['top', 'new'] as const).map((option) => (
                  <button
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
                  </button>
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
                    <option value="all">All Sentiment</option>
                    {Object.entries(sentimentDefinitions).map(
                      ([key, value]) => (
                        <option key={key} value={key}>
                          {value.label}
                        </option>
                      ),
                    )}
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
              counterClaims.length ? (
                counterClaims.map((claim) => (
                  <CounterClaimCard key={claim.id} claim={claim} />
                ))
              ) : (
                <ScamEmptyState
                  title="No counter claims yet"
                  description="Create a counter claim to contest this alert and gather CP support."
                />
              )
            ) : discussionComments.length ? (
              discussionComments.map((comment) => (
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
    <article className="rounded-[16px] border border-[#e0dbd1] bg-white px-6 py-5 shadow-[0px_12px_28px_rgba(15,23,42,0.05)]">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-[6px] border border-black/10 bg-[#ebebeb] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-black">
          <ShieldWarning size={15} weight="fill" className="text-[#c86423]" />
          Scam & Fraud
        </div>
        <h2 className="text-[22px] font-semibold text-[#1f1f1f]">
          {thread.title}
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-black/50">
          <span>BY:</span>
          <span className="inline-flex items-center gap-2 text-[13px] normal-case tracking-normal text-black">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-black/5 text-xs font-semibold text-black/70">
              {thread.author.avatarFallback}
            </span>
            {thread.author.name}
          </span>
          <span className="text-black/40">{thread.author.postedAt}</span>
        </div>
        <div className="text-[15px] leading-relaxed text-black/80">
          {renderParagraphWithLinks(primaryParagraph)}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-black">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
            Tags:
          </span>
          {thread.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-[6px] bg-black/5 px-3 py-1 text-[12px] font-semibold text-black"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {thread.attachmentsCount ? (
            <span className="inline-flex items-center gap-2 rounded-[8px] bg-[#ebebeb] px-3 py-2 text-sm font-semibold text-black/70">
              <ChartBar size={18} className="text-black/50" />
              {thread.attachmentsCount}
            </span>
          ) : null}
        </div>
      </div>
      <div className="mt-5 space-y-3">
        <SupportClaimAction
          current={thread.cpProgress.current}
          target={thread.cpProgress.target}
        />
        <div className="flex flex-col gap-3">
          <button className="min-w-[160px] flex-1 rounded-[8px] bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black/85">
            Counter This Claim
          </button>
          <button className="min-w-[160px] flex-1 rounded-[8px] border border-black/20 px-5 py-3 text-sm font-semibold text-black">
            Post Comment
          </button>
        </div>
      </div>
    </article>
  );
}

type SupportClaimActionProps = {
  current: number;
  target: number;
};

function SupportClaimAction({ current, target }: SupportClaimActionProps) {
  return (
    <Button className="cursor flex w-full items-center justify-center gap-[10px] rounded-[8px] border border-black/10 bg-[#EBEBEB] px-[10px]  py-[4px] text-black">
      <CaretCircleUp size={30} weight="fill" className="opacity-30" />
      <span className="text-[14px] font-[500] text-black/60">
        Support This Claim
      </span>
      <span className="text-[12px] text-black/60">
        {current.toLocaleString()} / {target.toLocaleString()}
      </span>
    </Button>
  );
}

const urlPattern = /(https?:\/\/[^\s]+)/g;

function renderParagraphWithLinks(paragraph: string) {
  if (!paragraph) return null;
  return paragraph.split(urlPattern).map((segment, index) => {
    if (!segment) {
      return null;
    }
    if (segment.startsWith('http')) {
      return (
        <a
          key={`${segment}-${index}`}
          href={segment}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[#1b9573] underline-offset-2 hover:underline"
        >
          {segment}
        </a>
      );
    }
    return (
      <span key={`${segment}-${index}`} className="text-black/80">
        {segment}
      </span>
    );
  });
}

type CounterClaimCardProps = {
  claim: AnswerItem;
};

function CounterClaimCard({ claim }: CounterClaimCardProps) {
  const percent = claim.cpTarget
    ? Math.min(100, Math.round((claim.cpSupport / claim.cpTarget) * 100))
    : 0;

  return (
    <article className="rounded-[12px] border border-[#ebe5dc] bg-white p-5 shadow-[0px_10px_25px_rgba(15,23,42,0.04)]">
      <div className="flex gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-black/5 text-sm font-semibold text-black/70">
          {claim.author[0]}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-black">
            <span>{claim.author}</span>
            <span className="rounded-[4px] bg-black/5 px-2 py-0.5 text-[11px] uppercase tracking-[0.18em] text-black/50">
              {claim.role}
            </span>
            <span className="text-xs font-normal uppercase tracking-[0.18em] text-black/40">
              {claim.createdAt}
            </span>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-black/80">
            {claim.body}
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-[10px] bg-[#f2f8f4] px-4 py-3 text-sm font-semibold text-[#167a57]">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2">
            <ChartBar size={18} />
            {claim.cpSupport.toLocaleString()} CP
          </span>
          {claim.cpTarget ? (
            <span className="text-xs text-black/50">
              Target {claim.cpTarget.toLocaleString()} CP · {percent}%
            </span>
          ) : null}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between text-sm font-semibold text-black/60">
        <span>Comments {claim.commentsCount}</span>
        <button className="rounded-[6px] border border-black/20 px-4 py-1.5 text-sm font-semibold text-black">
          Post Comment
        </button>
      </div>
    </article>
  );
}

type DiscussionCommentCardProps = {
  comment: CommentItem;
};

function DiscussionCommentCard({ comment }: DiscussionCommentCardProps) {
  return (
    <article className="rounded-[12px] border border-[#ebe5dc] bg-white p-5">
      <div className="flex gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-black/5 text-sm font-semibold text-black/70">
          {comment.author[0]}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-black">
            <span>{comment.author}</span>
            <span className="text-xs uppercase tracking-[0.18em] text-black/40">
              {comment.role}
            </span>
            <span className="text-xs text-black/50">{comment.createdAt}</span>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-black/80">
            {comment.body}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-[6px] border border-black/15 px-4 py-1.5 text-sm font-semibold text-black">
          Reply
        </button>
        <button className="rounded-[6px] border border-black/15 px-4 py-1.5 text-sm font-semibold text-black">
          React
        </button>
      </div>
    </article>
  );
}

type ScamEmptyStateProps = {
  title: string;
  description: string;
};

function ScamEmptyState({ title, description }: ScamEmptyStateProps) {
  return (
    <div className="rounded-[12px] border border-dashed border-black/15 bg-[#fcfbf9] px-6 py-10 text-center">
      <p className="text-sm font-semibold text-black">{title}</p>
      <p className="mt-2 text-sm text-black/60">{description}</p>
    </div>
  );
}
