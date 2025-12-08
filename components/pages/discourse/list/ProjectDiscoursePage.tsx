'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/base';
import { trpc } from '@/lib/trpc/client';

import { useProjectDetailContext } from '../../project/context/projectDetailContext';
import { TopbarFilters } from '../common/TopbarFilters';
import { SentimentKey } from '../common/sentiment/sentimentConfig';
import { discourseTopicOptions } from '../common/topicOptions';
import { useDiscussionThreads } from '../hooks/useDiscussionThreads';

import { DiscoursePageLayout } from './DiscoursePageLayout';
import { ThreadList } from './ThreadList';
import { TopicsSidebar } from './TopicsSidebar';
import { useThreadListControls } from './useThreadListControls';

const projectSortOptions = ['top', 'new'];
const statusTabs = ['all', 'redressed', 'unanswered'];
const sentimentOptions = [
  'recommend',
  'agree',
  'insightful',
  'provocative',
  'disagree',
];

type ProjectComplaintsPageProps = {
  projectId: string;
};

type ProjectComplaintsMeta = {
  complaintsCount?: number;
  redressedCount?: number;
  scamAlertCount?: number;
};

export default function ProjectDiscoursePage({
  projectId,
}: ProjectComplaintsPageProps) {
  const router = useRouter();
  const { project, isProjectFetched } = useProjectDetailContext();
  const projectMeta = project as typeof project & ProjectComplaintsMeta;
  const numericProjectId = Number(projectId);
  const isValidProjectId = Number.isFinite(numericProjectId);

  const threadStatsQuery =
    trpc.projectDiscussionThread.getProjectStats.useQuery(
      { projectId: numericProjectId },
      { enabled: isValidProjectId },
    );

  const complaintsCount =
    threadStatsQuery.data?.total ?? projectMeta?.complaintsCount ?? 0;
  const redressedCount = projectMeta?.redressedCount ?? 0;
  const scamAlertCount =
    threadStatsQuery.data?.scamAlerts ?? projectMeta?.scamAlertCount ?? 0;

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
    isScamFilter,
    alertOnlyFilter,
  } = useThreadListControls({
    statusTabs,
    sortOptions: projectSortOptions,
  });

  const {
    threads,
    isLoading,
    isFetched,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useDiscussionThreads({
    projectId: numericProjectId,
    categories: selectedTopics,
    enabled: isValidProjectId,
    sort: activeSort === 'top' ? 'top' : 'new',
    status: activeStatus as 'all' | 'redressed' | 'unanswered',
    isScam: isScamFilter || alertOnlyFilter ? true : undefined,
    alertOnly: alertOnlyFilter,
  });

  const createThreadHref = `/discourse/create?projectId=${projectId}`;

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
        <div className="flex gap-[10px] rounded-[10px] bg-black/5 px-4 py-2 text-sm font-[400] text-black/70">
          <span>
            Complaints:{' '}
            <span className="font-semibold text-black">{complaintsCount}</span>
          </span>
          <span>
            Redressed:{' '}
            <span className="font-semibold text-black">{redressedCount}</span>
          </span>
        </div>
      }
      actions={
        <>
          <Button
            className="h-10 rounded-[5px] bg-black px-5 text-[13px] font-semibold text-white hover:bg-black/85"
            onPress={() => router.push(createThreadHref)}
          >
            Create a Thread
          </Button>
          <Button className="h-10 rounded-[5px] border border-black/80 bg-white px-5 text-[13px] font-semibold text-black hover:bg-black/5">
            Leaderboard
          </Button>
          {scamAlertCount > 0 ? (
            <Button
              className="h-10 rounded-[5px] border border-[#BB5D00] bg-[rgba(187,93,0,0.10)] px-[10px] text-[13px] font-semibold text-[#BB5D00] hover:bg-[#ecb47d]"
              onPress={() =>
                router.push(
                  `/project/${projectId}/complaints?isScam=true&alertOnly=true&status=all`,
                )
              }
            >
              View Scam Alerts
              <span>{scamAlertCount}</span>
            </Button>
          ) : null}
        </>
      }
      sidebar={
        <TopicsSidebar
          title="Filter by Topic"
          topics={discourseTopicOptions}
          selectedTopics={selectedTopics}
          onTopicToggle={toggleTopic}
          onClear={clearTopics}
          onCreateThread={() => router.push(createThreadHref)}
        />
      }
    >
      <TopbarFilters
        statusTabs={statusTabs}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        sortOptions={projectSortOptions}
        activeSort={activeSort}
        onSortChange={setActiveSort}
        sentimentOptions={sentimentOptions}
        selectedSentiment={activeSentiment}
        onSentimentChange={(value) => setActiveSentiment(value)}
      />
      <ThreadList
        isLoading={isLoading}
        isFetched={isFetched}
        isFetchingNextPage={isFetchingNextPage}
        threads={threads}
        emptyMessage={
          isValidProjectId
            ? 'No complaints yet for this project.'
            : 'Unable to load complaints for this project.'
        }
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
            Load more
          </Button>
        </div>
      ) : null}
    </DiscoursePageLayout>
  );
}
