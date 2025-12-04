import { ScamThreadDetailPage } from '@/components/pages/discourse/ScamThreadDetailPage';
import { threadDataset } from '@/components/pages/discourse/threadData';
import { ThreadDetailPage } from '@/components/pages/discourse/ThreadDetailPage';

type ThreadDetailRouteProps = {
  params: Promise<{
    threadId: string;
  }>;
};

export default async function ThreadDetailRoute({
  params,
}: ThreadDetailRouteProps) {
  const { threadId } = await params;
  const fallbackRecord = threadDataset[threadId];

  if (fallbackRecord?.isScam) {
    return (
      <ScamThreadDetailPage
        threadId={threadId}
        fallbackThread={fallbackRecord}
      />
    );
  }

  return <ThreadDetailPage threadId={threadId} />;
}
