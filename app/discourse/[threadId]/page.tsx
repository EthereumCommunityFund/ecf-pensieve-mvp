import { threadDataset } from '@/components/pages/discourse/common/threadData';
import { ScamThreadDetailPage } from '@/components/pages/discourse/detail/ScamThreadDetailPage';
import { ThreadDetailPage } from '@/components/pages/discourse/detail/ThreadDetailPage';

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
