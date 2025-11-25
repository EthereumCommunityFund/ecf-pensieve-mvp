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
        secondaryAction={
          <button
            className="inline-flex h-9 items-center rounded-[6px] bg-black px-4 text-[13px] font-semibold text-white hover:bg-black/80"
            onClick={() => router.push('/discourse/create')}
          >
            Create a Thread
          </button>
        }
      />
      <ThreadList
        threads={threads}
        onThreadSelect={(thread) => router.push(`/discourse/${thread.id}`)}
      />
    </DiscoursePageLayout>
  );
}
