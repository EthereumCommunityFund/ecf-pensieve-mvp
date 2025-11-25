'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { useProjectDetailContext } from '../project/context/projectDetailContext';

import { DiscoursePageLayout } from './DiscoursePageLayout';
import { ThreadFilters } from './ThreadFilters';
import { ThreadList, type ThreadMeta } from './ThreadList';
import { TopicsSidebar } from './TopicsSidebar';
import { discourseTopicOptions } from './topicOptions';

const projectSortOptions = ['top', 'new', 'agreed'];
const statusTabs = ['all', 'redressed', 'unanswered'];
const sentimentOptions = [
  'recommend',
  'agree',
  'insightful',
  'provocative',
  'disagree',
];
const placeholderThreads: ThreadMeta[] = [
  {
    id: 'p-1',
    title: 'Liquidity mining rewards delayed',
    excerpt:
      'Contributors reported missing payouts for week 34 and are requesting an ETA for resolution.',
    author: 'CommunityMember',
    timeAgo: '5 days ago',
    replies: 5,
    votes: 56,
    badge: 'Complaint Topic',
    tag: 'Customer Support & Comms',
    sentiment: 'Agree',
    answeredCount: 1,
    totalSentimentVotes: 18,
    sentimentBreakdown: [
      { key: 'recommend', percentage: 35 },
      { key: 'agree', percentage: 30 },
      { key: 'insightful', percentage: 20 },
      { key: 'provocative', percentage: 15 },
    ],
  },
  {
    id: 'p-2',
    title: 'Need clarity on scam alerts',
    excerpt:
      'Multiple token holders flagged suspicious OTC offers surrounding the project.',
    author: 'Watcher',
    timeAgo: '2 days ago',
    replies: 2,
    votes: 32,
    badge: 'Complaint Topic',
    status: 'Alert Displayed',
    tag: 'Scam & Fraud Concerns',
    sentiment: 'Provocative',
    totalSentimentVotes: 24,
    sentimentBreakdown: [
      { key: 'recommend', percentage: 10 },
      { key: 'agree', percentage: 15 },
      { key: 'provocative', percentage: 45 },
      { key: 'disagree', percentage: 30 },
    ],
  },
];

type ProjectComplaintsPageProps = {
  projectId: string;
};

type ProjectComplaintsMeta = {
  complaintsCount?: number;
  redressedCount?: number;
  scamAlertCount?: number;
};

export default function ProjectComplaintsPage({
  projectId,
}: ProjectComplaintsPageProps) {
  const router = useRouter();
  const { project, isProjectFetched } = useProjectDetailContext();
  const projectMeta = project as typeof project & ProjectComplaintsMeta;

  const complaintsCount = projectMeta?.complaintsCount ?? 0;
  const redressedCount = projectMeta?.redressedCount ?? 0;
  const scamAlertCount = projectMeta?.scamAlertCount ?? 0;

  const [activeStatus, setActiveStatus] = useState(statusTabs[0]);
  const [activeSort, setActiveSort] = useState(projectSortOptions[0]);
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

  const projectInitial = project?.name?.[0]?.toUpperCase() ?? 'P';
  const projectAvatar = project?.logoUrl ? (
    <div className="size-14 overflow-hidden rounded-[12px] border border-black/5 bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={project.logoUrl}
        alt={`${project?.name || 'Project'} logo`}
        className="size-full object-cover"
      />
    </div>
  ) : (
    <div className="flex size-14 items-center justify-center rounded-[12px] border border-dashed border-black/20 bg-black/5 text-sm font-semibold text-black/60">
      {projectInitial}
    </div>
  );

  return (
    <DiscoursePageLayout
      title={
        isProjectFetched ? project?.name || 'Project Name' : 'Project Name'
      }
      description="Project Complaints"
      titleAddon={projectAvatar}
      breadcrumbs={[
        { label: 'Back', href: `/project/${projectId}` },
        { label: project?.name || 'Project Name' },
        { label: 'Complaints' },
      ]}
      meta={
        <div className="rounded-[10px] bg-black/5 px-4 py-2 text-sm text-black/70">
          <span>
            Complaints:{' '}
            <span className="font-semibold text-black">{complaintsCount}</span>
          </span>
          <span className="mx-3 inline-block size-1 rounded-full bg-black/30 align-middle" />
          <span>
            Redressed:{' '}
            <span className="font-semibold text-black">{redressedCount}</span>
          </span>
        </div>
      }
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
          <button className="h-10 rounded-[5px] border border-[#c46a1d] bg-[#fff6ee] px-5 text-[13px] font-semibold text-[#c46a1d]">
            View Scam Alerts
            <span className="ml-2 rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold">
              {scamAlertCount}
            </span>
          </button>
        </>
      }
      sidebar={
        <TopicsSidebar
          title="Filter by Topic"
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
        sortOptions={projectSortOptions}
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
