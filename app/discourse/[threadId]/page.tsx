import { ScamThreadDetailPage } from '@/components/pages/discourse/ScamThreadDetailPage';
import { ThreadDetailPage } from '@/components/pages/discourse/ThreadDetailPage';
import { threadDataset } from '@/components/pages/discourse/threadData';

type ThreadDetailRouteProps = {
  params: Promise<{
    threadId: string;
  }>;
};

export default async function ThreadDetailRoute({
  params,
}: ThreadDetailRouteProps) {
  const { threadId } = await params;

  const record = threadDataset[threadId];

  if (record?.isScam) {
    return <ScamThreadDetailPage threadId={threadId} />;
  }

  return <ThreadDetailPage threadId={threadId} />;
}
