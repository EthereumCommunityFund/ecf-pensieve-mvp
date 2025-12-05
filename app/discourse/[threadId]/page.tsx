import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import { ScamThreadDetailPage } from '@/components/pages/discourse/detail/ScamThreadDetailPage';
import { ThreadDetailPage } from '@/components/pages/discourse/detail/ThreadDetailPage';
import { appRouter } from '@/lib/trpc/routers';
import { createTRPCContext } from '@/lib/trpc/server';

type ThreadDetailRouteProps = {
  params: Promise<{
    threadId: string;
  }>;
};

export default async function ThreadDetailRoute({
  params,
}: ThreadDetailRouteProps) {
  const { threadId } = await params;
  const numericThreadId = Number(threadId);
  if (!Number.isFinite(numericThreadId)) {
    notFound();
  }

  let isScam = false;

  try {
    const caller = appRouter.createCaller(
      await createTRPCContext({ headers: new Headers(await headers()) }),
    );
    const thread = await caller.projectDiscussionThread.getThreadById({
      threadId: numericThreadId,
    });
    isScam = Boolean(thread.isScam);
  } catch {
    notFound();
  }

  if (isScam) {
    return <ScamThreadDetailPage threadId={threadId} />;
  }

  return <ThreadDetailPage threadId={threadId} />;
}
