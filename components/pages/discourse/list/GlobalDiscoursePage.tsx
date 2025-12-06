'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/base';

import { TopbarFilters } from '../common/TopbarFilters';
import { discourseTopicOptions } from '../common/topicOptions';
import { useDiscussionThreads } from '../hooks/useDiscussionThreads';

import { DiscoursePageLayout } from './DiscoursePageLayout';
import { ThreadList } from './ThreadList';
import { TopicsSidebar } from './TopicsSidebar';

const statusTabs = ['all', 'redressed', 'unanswered'];
const sortOptions = ['top', 'new'];
const sentimentOptions = [
  'recommend',
  'agree',
  'insightful',
  'provocative',
  'disagree',
];
export default function GlobalDiscoursePage() {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState(statusTabs[0]);
  const [activeSort, setActiveSort] = useState(sortOptions[0]);
  const [activeSentiment, setActiveSentiment] = useState<string>('all');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const {
    threads,
    isFetched,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useDiscussionThreads({
    categories: selectedTopics,
  });

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
          <Button
            className="h-10 bg-black px-[10px] text-white hover:bg-black/80"
            onPress={() => router.push('/discourse/create')}
          >
            Create a Thread
          </Button>
          <Button className="h-10 border border-[#222] bg-white px-[10px] font-semibold text-black hover:bg-black/20">
            Leaderboard
          </Button>
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
      <TopbarFilters
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
        isFetched={isFetched}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        threads={threads}
        emptyMessage="No complaints found for the current filters."
        onThreadSelect={(thread) => router.push(`/discourse/${thread.id}`)}
      />
      {hasNextPage ? (
        <div className="mt-4 flex justify-center">
          <Button
            className="rounded-full border border-black/10 px-6 py-2 text-sm font-semibold text-black"
            isLoading={isFetchingNextPage}
            onPress={() => fetchNextPage()}
          >
            Load more threads
          </Button>
        </div>
      ) : null}
    </DiscoursePageLayout>
  );
}
