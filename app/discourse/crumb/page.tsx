'use client';
'use client';

import {
  ArrowLeftIcon,
  ArrowUpIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

import type { SentimentMetric } from '@/components/pages/discourse/common/sentiment/sentimentConfig';
import { ContributionCard } from '@/components/pages/discourse/crumb/ContributionCard';
import { DiscourseCrumbHero } from '@/components/pages/discourse/crumb/DiscourseCrumbHero';
import {
  ParticipationCard,
  type ParticipationStep,
} from '@/components/pages/discourse/crumb/ParticipationCard';
import { SentimentCard } from '@/components/pages/discourse/crumb/SentimentCard';
import { ThreadSurface } from '@/components/pages/discourse/crumb/ThreadSurface';

const answerHighlights = [
  '“Trust math + open networks” rather than middlemen',
  'Apps that cannot be shut down by one company',
  'Agreements that execute automatically on-chain',
  'Communities and digital economies owned by users',
];

const heroBodyParagraphs = [
  'Every time I search “What is Ethereum” I get 18 paragraphs about smart contracts, decentralized networks, blockchain scalability, zk-roll-whatevers, and at no point does anyone just say straight up what Ethereum is trying to do in the world.',
  'Is the point to replace banks? Become some world computer? Let people trade cartoon cats for six figures?',
  'Something like: “Ethereum exists to ______.”',
];

const heroBodyDoc = JSON.stringify({
  content: heroBodyParagraphs
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join(''),
  type: 'doc',
  isEmpty: heroBodyParagraphs.every((paragraph) => !paragraph.trim()),
});

const sentimentStats: SentimentMetric[] = [
  { key: 'recommend', percentage: 40 },
  { key: 'agree', percentage: 60 },
  { key: 'insightful', percentage: 35 },
  { key: 'provocative', percentage: 25 },
  { key: 'disagree', percentage: 15 },
];

const participationSteps: ParticipationStep[] = [
  {
    title: 'Discuss and Support',
    description:
      'Comment, reply, and vote on answers that help the conversation progress toward a useful outcome.',
    actions: ['Upvote Post', 'Leave a Comment', 'Leave Your Sentiment'],
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
              body={heroBodyDoc}
              tags={['WTF', 'Ethereum']}
              author={{ name: 'Username', initial: 'U', timeAgo: 'a week ago' }}
              metrics={[
                { icon: ChartBarIcon, value: '4', showLabel: false },
                { icon: ArrowUpIcon, label: 'CPs', value: '380' },
              ]}
              primaryAction={{ label: 'Answer This Question' }}
              secondaryAction={{ label: 'Post Comment' }}
            />
            <ThreadSurface
              answerHighlights={answerHighlights}
              sentimentStats={sentimentStats}
            />
          </div>
          <aside className="w-full max-w-[320px] space-y-5">
            <ContributionCard voteCount={380} />
            <SentimentCard sentiments={sentimentStats} totalVotes={4} />
            <ParticipationCard steps={participationSteps} />
          </aside>
        </section>
      </div>
    </div>
  );
}
