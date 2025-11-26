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

  return <ThreadDetailPage threadId={threadId} />;
}
