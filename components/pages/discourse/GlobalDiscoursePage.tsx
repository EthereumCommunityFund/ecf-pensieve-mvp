'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { DiscoursePageLayout } from './DiscoursePageLayout';
import { ThreadFilters } from './ThreadFilters';
import { ThreadList, type ThreadMeta } from './ThreadList';
import { TopicsSidebar } from './TopicsSidebar';
import { discourseTopicOptions } from './topicOptions';

const statusTabs = ['all', 'redressed', 'unanswered'];
const sortOptions = ['top', 'new'];
const sentimentOptions = [
  'recommend',
  'agree',
  'insightful',
  'provocative',
  'disagree',
];
const placeholderThreads: ThreadMeta[] = [
  {
    id: '1',
    title: 'What in the actual..is Ethereum’s Mission?',
    excerpt:
      'Optional excerpt describing the raised complaint or question to help readers quickly scan the context.',
    author: 'Username',
    timeAgo: '1 week ago',
    replies: 12,
    votes: 380,
    badge: 'Complaint Topic',
    status: 'Redressed',
    tag: 'General Issue',
    answeredCount: 2,
    sentiment: 'Agree',
    totalSentimentVotes: 42,
    sentimentBreakdown: [
      { key: 'recommend', percentage: 40 },
      { key: 'agree', percentage: 30 },
      { key: 'insightful', percentage: 20 },
      { key: 'disagree', percentage: 10 },
    ],
  },
  {
    id: '2',
    title: 'Project Alpha - Fund allocation transparency',
    excerpt:
      'Members are asking for clarity on how grants and rewards are distributed for this ecosystem.',
    author: 'BuilderOne',
    timeAgo: '3 days ago',
    replies: 8,
    votes: 74,
    badge: 'Complaint Topic',
    tag: 'Governance & DAO',
    sentiment: 'Insightful',
    sentimentBreakdown: [
      { key: 'recommend', percentage: 15 },
      { key: 'agree', percentage: 35 },
      { key: 'insightful', percentage: 35 },
      { key: 'provocative', percentage: 15 },
    ],
    totalSentimentVotes: 28,
  },
  {
    id: '3',
    title: 'Multiple scam alerts connected to OTC token sale',
    excerpt:
      'Early supporters reported suspicious OTC offers. Please review if this should be escalated to Scam Alerts.',
    author: 'Watcher',
    timeAgo: '4 days ago',
    replies: 15,
    votes: 122,
    badge: 'Complaint Topic',
    status: 'Alert Displayed on Page',
    tag: 'Scam & Fraud Concerns',
    sentiment: 'Disagree',
    sentimentBreakdown: [
      { key: 'recommend', percentage: 5 },
      { key: 'agree', percentage: 15 },
      { key: 'insightful', percentage: 20 },
      { key: 'disagree', percentage: 60 },
    ],
    totalSentimentVotes: 64,
  },
  {
    id: '4',
    title: 'Validator payout queue stuck for 36 hours',
    excerpt:
      'Operators across different staking pools are reporting delayed validator balance updates inside the shared dashboard.',
    author: 'YieldFarmerX',
    timeAgo: '6 days ago',
    replies: 9,
    votes: 98,
    badge: 'Complaint Topic',
    status: 'Pending Review',
    tag: 'Infra & Ops',
    sentiment: 'Recommend',
    sentimentBreakdown: [
      { key: 'recommend', percentage: 45 },
      { key: 'agree', percentage: 20 },
      { key: 'insightful', percentage: 25 },
      { key: 'disagree', percentage: 10 },
    ],
    totalSentimentVotes: 31,
  },
  {
    id: '5',
    title: 'More disclosure on matching partner seat allocations',
    excerpt:
      'Community advocates want to see how matching partners are selected and what accountability mechanisms exist if they do not participate.',
    author: 'TransparencyNerd',
    timeAgo: '1 day ago',
    replies: 6,
    votes: 41,
    badge: 'Complaint Topic',
    tag: 'Governance & DAO',
    sentiment: 'Insightful',
    answeredCount: 1,
    sentimentBreakdown: [
      { key: 'recommend', percentage: 20 },
      { key: 'agree', percentage: 30 },
      { key: 'insightful', percentage: 35 },
      { key: 'provocative', percentage: 15 },
    ],
    totalSentimentVotes: 22,
  },
  {
    id: '6',
    title: 'HashRate reporting appears to double count archive nodes',
    excerpt:
      'Two regional contributors claim the public transparency board is misreporting node counts, possibly due to outdated scripts.',
    author: 'InfraAudit',
    timeAgo: '3 hours ago',
    replies: 4,
    votes: 67,
    badge: 'Complaint Topic',
    status: 'Investigating',
    tag: 'Technical & Bugs',
    sentiment: 'Agree',
    sentimentBreakdown: [
      { key: 'recommend', percentage: 25 },
      { key: 'agree', percentage: 45 },
      { key: 'insightful', percentage: 20 },
      { key: 'disagree', percentage: 10 },
    ],
    totalSentimentVotes: 30,
  },
  {
    id: '7',
    title: 'Unable to withdraw claimable retro funding',
    excerpt:
      'Recipients hitting “Something went wrong” when trying to move retro grant tranches to multisig wallets during the last two days.',
    author: 'RetroBuilder',
    timeAgo: '10 hours ago',
    replies: 11,
    votes: 156,
    badge: 'Complaint Topic',
    status: 'Escalated',
    tag: 'Funding & Grants',
    sentiment: 'Provocative',
    sentimentBreakdown: [
      { key: 'recommend', percentage: 10 },
      { key: 'agree', percentage: 25 },
      { key: 'provocative', percentage: 40 },
      { key: 'disagree', percentage: 25 },
    ],
    totalSentimentVotes: 50,
  },
  {
    id: '8',
    title: 'Need clarity on ECF reporting cadence',
    excerpt:
      'Supporters wish to know if status updates will follow a weekly, bi-weekly, or monthly summary to reduce speculation.',
    author: 'TheReader',
    timeAgo: '2 weeks ago',
    replies: 13,
    votes: 83,
    badge: 'Complaint Topic',
    tag: 'Community Feedback',
    sentiment: 'Agree',
    answeredCount: 3,
    sentimentBreakdown: [
      { key: 'recommend', percentage: 18 },
      { key: 'agree', percentage: 42 },
      { key: 'insightful', percentage: 30 },
      { key: 'disagree', percentage: 10 },
    ],
    totalSentimentVotes: 39,
  },
  {
    id: '9',
    title: 'Localization backlog creates onboarding gap',
    excerpt:
      'Regional community leads note that educational kits are only available in English which blocks new contributors.',
    author: 'GlobeTrotter',
    timeAgo: '8 hours ago',
    replies: 7,
    votes: 59,
    badge: 'Complaint Topic',
    tag: 'Community Feedback',
    sentiment: 'Recommend',
    sentimentBreakdown: [
      { key: 'recommend', percentage: 55 },
      { key: 'agree', percentage: 20 },
      { key: 'insightful', percentage: 15 },
      { key: 'disagree', percentage: 10 },
    ],
    totalSentimentVotes: 28,
  },
  {
    id: '10',
    title: 'Community call recordings missing chapter timestamps',
    excerpt:
      'Volunteers that rely on asynchronous content are requesting structured recaps and timestamps for last month’s governance calls.',
    author: 'AsyncOnly',
    timeAgo: '3 days ago',
    replies: 3,
    votes: 27,
    badge: 'Complaint Topic',
    tag: 'Community Feedback',
    sentiment: 'Insightful',
    sentimentBreakdown: [
      { key: 'recommend', percentage: 12 },
      { key: 'agree', percentage: 28 },
      { key: 'insightful', percentage: 45 },
      { key: 'disagree', percentage: 15 },
    ],
    totalSentimentVotes: 25,
  },
  {
    id: '11',
    title: 'Quadratic funding scoreboard not updating live',
    excerpt:
      'The leaderboard froze for 15 minutes during the busiest matching round, confusing donors about real-time impact.',
    author: 'RoundOperator',
    timeAgo: '14 hours ago',
    replies: 10,
    votes: 110,
    badge: 'Complaint Topic',
    status: 'Issue Logged',
    tag: 'Technical & Bugs',
    sentiment: 'Agree',
    sentimentBreakdown: [
      { key: 'recommend', percentage: 22 },
      { key: 'agree', percentage: 44 },
      { key: 'insightful', percentage: 24 },
      { key: 'disagree', percentage: 10 },
    ],
    totalSentimentVotes: 45,
  },
  {
    id: '12',
    title: 'Need guidelines for sunsetting community maintainers',
    excerpt:
      'Multiple DAOs referenced unclear criteria for when to rotate or offboard maintainers without causing public drama.',
    author: 'OpsCoach',
    timeAgo: '6 days ago',
    replies: 5,
    votes: 46,
    badge: 'Complaint Topic',
    tag: 'Governance & DAO',
    sentiment: 'Insightful',
    sentimentBreakdown: [
      { key: 'recommend', percentage: 18 },
      { key: 'agree', percentage: 32 },
      { key: 'insightful', percentage: 38 },
      { key: 'provocative', percentage: 12 },
    ],
    totalSentimentVotes: 26,
  },
  {
    id: '13',
    title: 'Spam filters hide legitimate negotiation threads',
    excerpt:
      'Moderators have noticed new contributor introductions being flagged, reducing healthy debate during onboarding.',
    author: 'ModCrew',
    timeAgo: '12 hours ago',
    replies: 4,
    votes: 36,
    badge: 'Complaint Topic',
    status: 'Needs Review',
    tag: 'Moderation & Safety',
    sentiment: 'Disagree',
    sentimentBreakdown: [
      { key: 'recommend', percentage: 8 },
      { key: 'agree', percentage: 14 },
      { key: 'disagree', percentage: 58 },
      { key: 'provocative', percentage: 20 },
    ],
    totalSentimentVotes: 50,
  },
];

export default function GlobalDiscoursePage() {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState(statusTabs[0]);
  const [activeSort, setActiveSort] = useState(sortOptions[0]);
  const [activeSentiment, setActiveSentiment] = useState<string>('all');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const threads = useMemo(() => placeholderThreads, []);

  const toggleTopic = (topic: string, selected: boolean) => {
    setSelectedTopics((prev) => {
      if (selected) {
        return prev.includes(topic) ? prev : [...prev, topic];
      }
      return prev.filter((item) => item !== topic);
    });
  };

  return (
    <DiscoursePageLayout
      title="Ethereum Community Discourse"
      description="General discussions and complaints across all projects."
      breadcrumbs={[{ label: 'Back', href: '/' }, { label: 'Discourse' }]}
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
        <TopicsSidebar
          topics={discourseTopicOptions}
          selectedTopics={selectedTopics}
          onTopicToggle={toggleTopic}
          onClear={() => setSelectedTopics([])}
          onCreateThread={() => router.push('/discourse/create')}
        />
      }
    >
      <ThreadFilters
        statusTabs={statusTabs}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        sortOptions={sortOptions}
        activeSort={activeSort}
        onSortChange={setActiveSort}
        sentimentOptions={sentimentOptions}
        selectedSentiment={activeSentiment}
        onSentimentChange={(value) => setActiveSentiment(value)}
      />
      <ThreadList
        threads={threads}
        onThreadSelect={(thread) => router.push(`/discourse/${thread.id}`)}
      />
    </DiscoursePageLayout>
  );
}
