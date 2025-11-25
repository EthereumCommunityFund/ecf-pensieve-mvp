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

type DetailedSentimentMetric = {
  key: SentimentKey;
  percentage: number;
  votes: number;
};

type AnswerItem = {
  id: string;
  author: string;
  role: string;
  createdAt: string;
  body: string;
  cpSupport: number;
  cpTarget?: number;
  sentimentLabel: SentimentKey;
  sentimentVotes: number;
  commentsCount: number;
  isAccepted?: boolean;
  statusTag?: string;
};

type CommentItem = {
  id: string;
  author: string;
  role: string;
  createdAt: string;
  body: string;
  sentimentLabel: SentimentKey;
};

type ThreadHighlight = {
  label: string;
  value: string;
};

type QuickAction = {
  label: string;
  helper: string;
};

type ThreadDetailRecord = {
  id: string;
  title: string;
  summary: string;
  badge: string;
  status: string;
  isScam: boolean;
  categories: string[];
  tags: string[];
  highlights: ThreadHighlight[];
  body: string[];
  cpProgress: {
    current: number;
    target: number;
    label: string;
    helper: string;
  };
  sentiment: DetailedSentimentMetric[];
  totalSentimentVotes: number;
  answers: AnswerItem[];
  counterClaims?: AnswerItem[];
  comments: CommentItem[];
  author: {
    name: string;
    handle: string;
    avatarFallback: string;
    role: string;
    postedAt: string;
    editedAt?: string;
  };
  participation: {
    supportSteps: string[];
    counterSteps: string[];
  };
  quickActions: QuickAction[];
};

const generalThread: ThreadDetailRecord = {
  id: '1',
  title: 'What in the actual..is Ethereum’s Mission?',
  summary:
    'A long-running thread that questions whether the Foundation is still aligned with the community-defined mission and how new programs are evaluated.',
  badge: 'Complaint Topic',
  status: 'Redressed',
  isScam: false,
  categories: ['Governance & DAO'],
  tags: ['Mission Alignment', 'Community Pulse', 'Funding Signals'],
  highlights: [
    { label: 'Answers', value: '12' },
    { label: 'Comments', value: '64' },
    { label: 'Views', value: '18.4k' },
  ],
  body: [
    'The OP outlines concerns that Ethereum’s public narrative and the incentives attached to multiple grant programs have drifted away from the original purpose of neutral coordination. They cite funding examples across three ecosystems and ask for a unified answer from EF stewards.',
    'Participants have requested clarification on who defines the north star mission today, how new initiatives are screened, and what data can be shared to show alignment checkpoints. The thread stays active because each answer is reviewed by volunteers who track Contribution Points.',
  ],
  cpProgress: {
    current: 1180,
    target: 2000,
    label: 'Contribution Points supporting the leading answer',
    helper:
      'Reaching 2,000 CP signals enough community confidence to lock this complaint as Redressed.',
  },
  sentiment: [
    { key: 'recommend', percentage: 32, votes: 148 },
    { key: 'agree', percentage: 26, votes: 112 },
    { key: 'insightful', percentage: 20, votes: 87 },
    { key: 'provocative', percentage: 12, votes: 52 },
    { key: 'disagree', percentage: 10, votes: 45 },
  ],
  totalSentimentVotes: 444,
  answers: [
    {
      id: 'ans-1',
      author: 'BuilderOne',
      role: 'Core Contributor',
      createdAt: 'Posted 6 days ago',
      body: 'Summarized the EF strategic narrative deck and linked to the yearly roadmap call that restated neutrality guardrails. Proposed quarterly public forums with Foundation leadership. The answer is co-signed by multiple long-term contributors.',
      cpSupport: 1180,
      cpTarget: 2000,
      sentimentLabel: 'agree',
      sentimentVotes: 86,
      commentsCount: 4,
      isAccepted: true,
      statusTag: 'Adopted',
    },
    {
      id: 'ans-2',
      author: 'ResearchGuild',
      role: 'Community Working Group',
      createdAt: 'Posted 4 days ago',
      body: 'Requests a third-party audit on historical funding decisions and suggests sending future proposals through a public scorecard. Recommends pairing EF statements with on-chain allocations.',
      cpSupport: 525,
      sentimentLabel: 'insightful',
      sentimentVotes: 44,
      commentsCount: 6,
    },
  ],
  comments: [
    {
      id: 'c-1',
      author: 'Watcher',
      role: 'Community Member',
      createdAt: '3 days ago',
      body: 'Appreciate the clarity. Would be helpful to add accountability milestones per vertical. Happy to draft a template if EF can endorse the format.',
      sentimentLabel: 'recommend',
    },
    {
      id: 'c-2',
      author: 'OpsLead',
      role: 'EF Moderator',
      createdAt: '2 days ago',
      body: 'We are preparing a follow-up timeline. Current plan is to test a lightweight advisory council before EthCC. Feedback welcome on scope.',
      sentimentLabel: 'insightful',
    },
  ],
  author: {
    name: 'Username',
    handle: '@mission-builder',
    avatarFallback: 'U',
    role: 'Community Member',
    postedAt: 'Posted 1 week ago',
    editedAt: 'Edited 2 days ago',
  },
  participation: {
    supportSteps: [
      'Share records or dashboards that validate the historical claim.',
      'Spend CP to upvote answers that provide verifiable remedies.',
      'Flag unanswered follow-ups so moderators can request updates.',
    ],
    counterSteps: [
      'Publish fresh data or links disproving the original assumption.',
      'Offer an alternative remediation plan and request CP support.',
      'Submit a moderator note if coordination or context is missing.',
    ],
  },
  quickActions: [
    { label: 'Update Post', helper: 'Add context, links, or clarifications.' },
    {
      label: 'Answer Complaint',
      helper: 'Share an actionable resolution path.',
    },
    { label: 'Post Comment', helper: 'Discuss evidence or ask for details.' },
  ],
};

const scamThread: ThreadDetailRecord = {
  id: '3',
  title: 'Multiple scam alerts connected to OTC token sale',
  summary:
    'Several early supporters flagged suspicious OTC offers that impersonate the project treasury. CP votes are required to surface the alert globally.',
  badge: '⚠️ Scam & Fraud',
  status: 'Alert Displayed on Page',
  isScam: true,
  categories: ['Scam & Fraud Concerns'],
  tags: ['Secondary Markets', 'OTC Sales', 'Security'],
  highlights: [
    { label: 'Alert Threshold', value: '9,000 CP' },
    { label: 'Supporters', value: '1,294' },
    { label: 'Evidence Links', value: '37 submissions' },
  ],
  body: [
    'The claim documents three OTC conversations where an impersonator shared forged treasury certificates, collected stablecoins, and disappeared. Screenshots and wallet traces are available to moderators.',
    'Victims are requesting that the project pauses OTC operations, publishes official addresses, and sets up a direct reporting hotline. Contributors can either support the alert or add counter claims if remediation already happened.',
  ],
  cpProgress: {
    current: 2899,
    target: 9000,
    label: 'Contribution Points supporting the main claim',
    helper:
      'Cross the 9,000 CP threshold to pin the alert across the project surfaces.',
  },
  sentiment: [
    { key: 'recommend', percentage: 22, votes: 186 },
    { key: 'agree', percentage: 28, votes: 238 },
    { key: 'insightful', percentage: 18, votes: 152 },
    { key: 'provocative', percentage: 11, votes: 92 },
    { key: 'disagree', percentage: 21, votes: 177 },
  ],
  totalSentimentVotes: 845,
  answers: [],
  counterClaims: [
    {
      id: 'counter-1',
      author: 'SecurityOps',
      role: 'Project Team',
      createdAt: 'Posted 3 hours ago',
      body: 'Escalated the wallets to centralized exchanges, revoked OTC permissions, and will publish an updated treasury registry in 24 hours. Inviting harmed users to submit reimbursements through a secure form.',
      cpSupport: 1450,
      cpTarget: 9000,
      sentimentLabel: 'agree',
      sentimentVotes: 38,
      commentsCount: 8,
      statusTag: 'Investigation',
    },
    {
      id: 'counter-2',
      author: 'CommunityWatch',
      role: 'Community Reviewer',
      createdAt: 'Posted 1 hour ago',
      body: 'Claims the OTC desk already notified their mailing list and is working with partners. Requests proof that reimbursements were processed but cautions against alert fatigue.',
      cpSupport: 620,
      cpTarget: 9000,
      sentimentLabel: 'provocative',
      sentimentVotes: 22,
      commentsCount: 3,
    },
  ],
  comments: [
    {
      id: 'scam-c-1',
      author: 'ConcernedHolder',
      role: 'Token Holder',
      createdAt: '1 hour ago',
      body: 'Lost 2,300 USDC to the impersonator. Support pinning this alert until verified wallets are added to Docs.',
      sentimentLabel: 'recommend',
    },
    {
      id: 'scam-c-2',
      author: 'ProjectMod',
      role: 'Moderator',
      createdAt: '45 minutes ago',
      body: 'Moderation team is verifying the Counter Claim evidence now. Expect an update later today.',
      sentimentLabel: 'insightful',
    },
  ],
  author: {
    name: 'Watcher',
    handle: '@watcher-alerts',
    avatarFallback: 'W',
    role: 'Community Safety',
    postedAt: 'Posted 12 hours ago',
    editedAt: 'Edited 2 hours ago',
  },
  participation: {
    supportSteps: [
      'Confirm you reviewed the evidence and understand CP will be locked.',
      'Support the claim with CP or attach on-chain proof via secure upload.',
      'Ping moderators if the alert should also live on the project landing page.',
    ],
    counterSteps: [
      'Submit a Counter Claim describing remediation progress.',
      'Invite supporters to stake CP to reach the same 9,000 CP bar.',
      'Encourage OP to retract the claim if the incident is resolved.',
    ],
  },
  quickActions: [
    {
      label: 'Support This Claim',
      helper: 'Spend CP to reach alert threshold.',
    },
    {
      label: 'Counter This Claim',
      helper: 'Propose remediation with evidence.',
    },
    { label: 'Retract Your Claim', helper: 'Available to OP once mitigated.' },
  ],
};

const threadDataset: Record<string, ThreadDetailRecord> = {
  '1': generalThread,
  '2': {
    ...generalThread,
    id: '2',
    title: 'Project Alpha - Fund allocation transparency',
    summary:
      'Contributors want to know whether treasury expansions still map to the published KPIs. Thread compiles conflicting statements from multiple AMAs.',
    tags: ['Treasury', 'Transparency', 'DAO Votes'],
  },
  'p-1': {
    ...generalThread,
    id: 'p-1',
    title: 'Liquidity mining rewards delayed',
    summary:
      'Reward schedule for week 34 is overdue. Contributors request clarity on how payouts are queued.',
    categories: ['Customer Support & Comms'],
    tags: ['Liquidity', 'Rewards'],
  },
  '3': scamThread,
  'p-2': {
    ...scamThread,
    id: 'p-2',
    title: 'Need clarity on scam alerts',
    summary:
      'Token holders noticed multiple OTC impersonations and want a permanent alert banner.',
  },
};

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

type SentimentSummaryCardProps = {
  sentiments: DetailedSentimentMetric[];
  totalVotes: number;
};

function SentimentSummaryCard({
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

function ParticipationCard({
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

function QuickActionsCard({ actions }: QuickActionsCardProps) {
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

function AnswerCard({ answer, isScam }: AnswerCardProps) {
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

function CommentCard({ comment }: CommentCardProps) {
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

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[16px] border border-dashed border-black/15 bg-white px-6 py-10 text-center text-black/60">
      <ChatCenteredDots size={28} className="mx-auto text-black/30" />
      <p className="mt-3 text-sm font-semibold text-black">{title}</p>
      <p className="mt-1 text-sm text-black/60">{description}</p>
    </div>
  );
}
