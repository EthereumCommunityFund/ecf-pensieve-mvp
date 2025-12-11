import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import { ScamThreadDetailPage } from '@/components/pages/discourse/detail/ScamThreadDetailPage';
import { ThreadDetailPage } from '@/components/pages/discourse/detail/ThreadDetailPage';
import { REDRESSED_SUPPORT_THRESHOLD } from '@/constants/discourse';
import {
  buildScamAlertMeta,
  buildThreadMeta,
  resolveTopicLabel,
} from '@/lib/services/discourseMeta';
import { appRouter } from '@/lib/trpc/routers';
import { createTRPCContext } from '@/lib/trpc/server';
import { getAppOrigin } from '@/lib/utils/url';

type ThreadDetailRouteProps = {
  params: Promise<{
    threadId: string;
  }>;
};

export async function generateMetadata({
  params,
}: ThreadDetailRouteProps): Promise<Metadata> {
  const { threadId } = await params;
  const numericThreadId = Number(threadId);
  if (!Number.isFinite(numericThreadId)) {
    notFound();
  }

  try {
    const caller = appRouter.createCaller(
      await createTRPCContext({ headers: new Headers(await headers()) }),
    );
    const thread = await caller.projectDiscussionThread.getThreadById({
      threadId: numericThreadId,
    });
    const project = thread.project
      ? {
          name: thread.project.name,
          tagline: thread.project.tagline,
          logoUrl: thread.project.logoUrl,
        }
      : null;
    const threadTag = resolveTopicLabel(
      thread.category?.[0] ?? thread.tags?.[0],
    );
    const origin = getAppOrigin();
    const path = `/discourse/${thread.id}`;
    const threadMeta = {
      id: thread.id,
      title: thread.title,
      post: thread.post,
      support: thread.support,
      isScam: thread.isScam,
      tag: threadTag,
    };

    if (thread.isScam && (thread.support ?? 0) >= REDRESSED_SUPPORT_THRESHOLD) {
      return buildScamAlertMeta({
        thread: threadMeta,
        project,
        origin,
        path,
        // threadTag already inside threadMeta
      });
    }

    return buildThreadMeta({
      thread: threadMeta,
      project,
      origin,
      path,
    });
  } catch {
    notFound();
  }
}

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
