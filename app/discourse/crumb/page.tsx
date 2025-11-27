'use client';
'use client';

import {
  ArrowLeftIcon,
  ArrowUpIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  HandThumbDownIcon,
  HandThumbUpIcon,
  StarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

import { DiscourseCrumbHero } from '@/components/pages/discourse/crumb/DiscourseCrumbHero';
import {
  MetricPill,
  type IconComponent,
} from '@/components/pages/discourse/crumb/MetricPill';

const answerHighlights = [
  '“Trust math + open networks” rather than middlemen',
  'Apps that cannot be shut down by one company',
  'Agreements that execute automatically on-chain',
  'Communities and digital economies owned by users',
];

const sentimentStats: Array<{
  label: string;
  icon: IconComponent;
  value: number;
  accent: string;
}> = [
  { label: 'Recommend', icon: StarIcon, value: 40, accent: 'bg-[#eca048]' },
  { label: 'Agree', icon: HandThumbUpIcon, value: 60, accent: 'bg-[#43bd9b]' },
  {
    label: 'Insightful',
    icon: UserCircleIcon,
    value: 35,
    accent: 'bg-[#6c6cff]',
  },
  {
    label: 'Provocative',
    icon: ExclamationTriangleIcon,
    value: 25,
    accent: 'bg-[#f97316]',
  },
  {
    label: 'Disagree',
    icon: HandThumbDownIcon,
    value: 15,
    accent: 'bg-[#ef4444]',
  },
];

const participationSteps = [
  {
    title: 'Discuss and Support',
    description:
      'Comment, reply, and vote on answers that help the conversation progress toward a useful outcome.',
    actions: ['Upvote Post', 'Leave a Comment', 'Leave Your Sentiment'],
  },
  {
    title: 'Give Answers',
    description:
      'Share answers that resolve the complaint or provide enough context for the original poster to move forward.',
    actions: ['Answer Complaint'],
  },
];

export default function DiscourseCrumbPage() {
  return (
    <div className="min-h-screen w-full bg-[#f6f4f1]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-5 pb-16 pt-6 md:px-10 lg:px-[100px]">
        <nav className="flex items-center gap-2 text-sm font-semibold text-black">
          <ArrowLeftIcon className="size-4" />
          <Link href="/discourse" className="hover:text-black/70">
            Back to Discourse
          </Link>
        </nav>
        <section className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-6">
            <DiscourseCrumbHero
              badgeLabel="Complaint Topic"
              title="What in the actual..is Ethereum’s Mission?"
              body={[
                'Every time I search “What is Ethereum” I get 18 paragraphs about smart contracts, decentralized networks, blockchain scalability, zk-roll-whatevers, and at no point does anyone just say straight up what Ethereum is trying to do in the world.',
                'Is the point to replace banks? Become some world computer? Let people trade cartoon cats for six figures?',
                'Something like: “Ethereum exists to ______.”',
              ]}
              tags={['WTF', 'Ethereum']}
              author={{ name: 'Username', initial: 'U', timeAgo: 'a week ago' }}
              metrics={[
                { icon: ChartBarIcon, label: 'Q Points', value: '4' },
                { icon: ArrowUpIcon, label: 'CPs', value: '380' },
              ]}
              primaryActionLabel="Answer This Question"
              secondaryActionLabel="Post Comment"
            />
            <ThreadSurface />
          </div>
          <aside className="w-full max-w-[320px] space-y-5">
            <ContributionCard />
            <SentimentCard />
            <ParticipationCard />
          </aside>
        </section>
      </div>
    </div>
  );
}

function ThreadSurface() {
  return (
    <div className="rounded-2xl border border-[#e7e4df] bg-white">
      <div className="flex flex-wrap items-center justify-between border-b border-[#e7e4df] px-6 py-4">
        <div className="flex flex-wrap items-center gap-6 text-sm font-semibold">
          <button className="relative flex items-center gap-2 border-b-2 border-black pb-2 text-black">
            Answers
            <span className="rounded-md bg-black/10 px-1 text-xs font-bold text-black/60">
              2
            </span>
          </button>
          <button className="flex items-center gap-2 text-black/60">
            Discuss
            <span className="rounded-md bg-black/5 px-1 text-xs font-bold text-black/40">
              5
            </span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <button className="rounded-md border border-black bg-white px-3 py-1 font-semibold text-black">
            Top
          </button>
          <button className="rounded-md border border-black/30 px-3 py-1 font-semibold text-black/60">
            New
          </button>
          <button className="inline-flex items-center gap-2 rounded-md border border-black/20 px-3 py-1 text-black/70">
            <ChartBarIcon className="size-4" />
            Sentiment
          </button>
        </div>
      </div>
      <div className="space-y-6 p-6">
        <AnswerCard />
        <CommentThread />
      </div>
    </div>
  );
}

function AnswerCard() {
  return (
    <div className="rounded-2xl border border-[#e7e4df] bg-white p-6">
      <div className="flex gap-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-black/5 text-lg font-semibold text-black">
          U
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-base font-semibold text-black">Username</p>
            <span className="rounded-md border border-[#43bd9b] bg-[#43bd9b]/10 px-3 py-1 text-xs font-semibold text-[#1b9573]">
              Highest voted answer
            </span>
            <span className="rounded-md border border-[#43bd9b] bg-[#43bd9b]/10 px-3 py-1 text-xs font-semibold text-[#1b9573]">
              Voted by Original Poster
            </span>
          </div>
          <div className="space-y-3 text-sm text-black/80">
            <p>
              Ethereum’s mission is to build an open, programmable financial +
              application system that anyone can use, without needing permission
              from banks, governments, or corporations.
            </p>
            <p>
              It wants to replace middlemen with code that anyone can verify and
              no one can control.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              {answerHighlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
            <p>
              TL;DR — Ethereum’s mission is to decentralize power in digital
              systems so ownership and control are shared by users instead of
              gatekeepers.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-black/60">
            <span>a week ago</span>
            <div className="flex items-center gap-2 rounded-xl bg-neutral-100 px-3 py-1">
              <ChartBarIcon className="size-4" />
              <span className="text-black">4</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-neutral-100 px-3 py-1">
              <ArrowUpIcon className="size-4 text-[#64c0a5]" />
              <span className="text-[#64c0a5]">2.5k</span>
            </div>
          </div>
          <div className="rounded-xl border border-black/10 p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-black/50">
              Sentiment breakdown
            </h4>
            <div className="space-y-3">
              {sentimentStats.map((stat) => (
                <div key={stat.label}>
                  <div className="flex items-center justify-between text-sm font-medium text-black">
                    <div className="flex items-center gap-2">
                      <stat.icon className="size-4 text-black/50" />
                      <span>{stat.label}</span>
                    </div>
                    <span className="text-black/60">{stat.value}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-black/5">
                    <div
                      className={`h-2 rounded-full ${stat.accent}`}
                      style={{ width: `${stat.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-black/50">
            <div className="flex flex-wrap gap-3">
              <TagPill label="Reno disagrees with this" />
              <TagPill label="Reno agrees with this" />
              <TagPill label="Reno finds this insightful" />
              <TagPill label="Reno recommends this" />
            </div>
            <div className="flex flex-wrap gap-3">
              <MetricPill icon={ChartBarIcon} label="Q Points" value="4" />
              <button className="rounded-md border border-black/20 px-3 py-1 text-xs font-semibold text-black/80">
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentThread() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#e7e4df] pb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-black">
          Comments
          <span className="rounded-md bg-black/10 px-1 text-xs font-bold text-black/60">
            00
          </span>
        </div>
        <button className="rounded-md border border-black/10 bg-neutral-50 px-4 py-1 text-sm font-semibold text-black">
          Post Comment
        </button>
      </div>
      <div className="flex gap-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-black/5 text-sm font-semibold text-black">
          R
        </div>
        <div className="flex-1 space-y-3 rounded-2xl border border-[#e7e4df] p-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <p className="font-semibold text-black">Reno</p>
            <span className="rounded-md border border-white bg-[#43bd9b]/20 px-2 py-0.5 text-xs font-semibold text-[#1b9573]">
              OP
            </span>
            <span className="text-xs font-semibold text-black/50">
              a week ago
            </span>
          </div>
          <div className="space-y-2 text-sm text-black/80">
            <p>Here is a response from OP</p>
            <span className="text-xs font-semibold text-black/50">
              EDITED 000/00/00
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-black/50">
            <TagPill label="Reno disagrees with this" />
            <TagPill label="Reno finds this provocative" />
            <TagPill label="Reno finds this insightful" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MetricPill icon={ChartBarIcon} label="Q Points" value="4" />
            <button className="rounded-md border border-black/10 bg-black/5 px-3 py-1 text-xs font-semibold text-black">
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContributionCard() {
  return (
    <div className="rounded-2xl border border-[#e7e4df] bg-white p-5">
      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-black">
        <ArrowUpIcon className="size-4" />
        Contribution Point Votes
      </div>
      <p className="mt-3 text-2xl font-semibold text-black">380</p>
      <div className="mt-4 border-t border-black/10 pt-3 text-sm text-black/70">
        <p className="font-semibold text-black">Redressed Threshold: 9000 CP</p>
        <p className="mt-1 text-xs">
          Required amount of CP support for an answer to be considered
          redressed.
        </p>
      </div>
    </div>
  );
}

function SentimentCard() {
  return (
    <div className="rounded-2xl border border-[#e7e4df] bg-white p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-black">
        <ChartBarIcon className="size-4" />
        User Sentiment
      </div>
      <p className="mt-1 text-xs font-semibold text-black/60">4 voted</p>
      <div className="mt-4 space-y-3">
        {sentimentStats.map((stat) => (
          <div key={stat.label}>
            <div className="flex items-center justify-between text-sm font-medium text-black">
              <div className="flex items-center gap-2">
                <stat.icon className="size-4 text-black/40" />
                <span>{stat.label}</span>
              </div>
              <span className="text-black/60">{stat.value}%</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-black/5">
              <div
                className={`h-2 rounded-full ${stat.accent}`}
                style={{ width: `${stat.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <button className="mt-4 text-xs font-semibold text-black/50 underline">
        What is User Sentiment?
      </button>
    </div>
  );
}

function ParticipationCard() {
  return (
    <div className="rounded-2xl border border-[#e7e4df] bg-white p-5">
      <div className="text-sm font-semibold text-black">
        How to participate?
      </div>
      <div className="mt-4 space-y-5">
        {participationSteps.map((step) => (
          <div
            key={step.title}
            className="space-y-3 border-b border-black/10 pb-4 last:border-b-0 last:pb-0"
          >
            <div>
              <p className="text-xs font-semibold uppercase text-black/60">
                {step.title}
              </p>
              <p className="mt-1 text-sm text-black/70">{step.description}</p>
            </div>
            <div className="space-y-2">
              {step.actions.map((action) => (
                <button
                  key={action}
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm font-semibold text-black hover:bg-black/5"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TagPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-black/5 px-2.5 py-1 text-[11px] font-semibold text-black/60">
      {label}
    </span>
  );
}
