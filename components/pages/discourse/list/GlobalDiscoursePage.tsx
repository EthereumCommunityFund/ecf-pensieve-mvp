'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/base';

import { TopbarFilters } from '../common/TopbarFilters';
import { SentimentKey } from '../common/sentiment/sentimentConfig';
import { discourseTopicOptions } from '../common/topicOptions';
import { useDiscussionThreads } from '../hooks/useDiscussionThreads';

import { DiscoursePageLayout } from './DiscoursePageLayout';
import { ThreadList } from './ThreadList';
import { TopicsSidebar } from './TopicsSidebar';
import { useThreadListControls } from './useThreadListControls';

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
  const {
    activeSentiment,
    activeSort,
    activeStatus,
    clearTopics,
    selectedTopics,
    setActiveSentiment,
    setActiveSort,
    setActiveStatus,
    toggleTopic,
  } = useThreadListControls({
    statusTabs,
    sortOptions,
  });
  const {
    threads,
    isFetched,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useDiscussionThreads({
    categories: selectedTopics,
    sort: activeSort === 'top' ? 'top' : 'new',
    status: activeStatus as 'all' | 'redressed' | 'unanswered',
  });

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
          onClear={clearTopics}
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
        sentimentSortKey={activeSentiment as SentimentKey | 'all'}
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
