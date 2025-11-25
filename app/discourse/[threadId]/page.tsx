import { ThreadDetailPage } from '@/components/pages/discourse/ThreadDetailPage';

type ThreadDetailRouteProps = {
  params: {
    threadId: string;
  };
};

export default function ThreadDetailRoute({ params }: ThreadDetailRouteProps) {
  return <ThreadDetailPage threadId={params.threadId} />;
}
