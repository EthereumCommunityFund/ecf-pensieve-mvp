import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import {
  buildAnswerMeta,
  resolveTopicLabel,
} from '@/lib/services/discourseMeta';
import { appRouter } from '@/lib/trpc/routers';
import { createTRPCContext } from '@/lib/trpc/server';
import { buildAbsoluteUrl, getAppOrigin } from '@/lib/utils/url';

type AnswerDetailRouteProps = {
  params: Promise<{
    threadId: string;
    answerId: string;
  }>;
};

export async function generateMetadata({
  params,
}: AnswerDetailRouteProps): Promise<Metadata> {
  const { threadId, answerId } = await params;
  const numericThreadId = Number(threadId);
  const numericAnswerId = Number(answerId);

  if (!Number.isFinite(numericThreadId) || !Number.isFinite(numericAnswerId)) {
    notFound();
  }

  try {
    const caller = appRouter.createCaller(
      await createTRPCContext({ headers: new Headers(await headers()) }),
    );
    const [thread, answer] = await Promise.all([
      caller.projectDiscussionThread.getThreadById({
        threadId: numericThreadId,
      }),
      caller.projectDiscussionInteraction.getAnswerById({
        answerId: numericAnswerId,
      }),
    ]);

    if (
      (answer.threadId && answer.threadId !== thread.id) ||
      (answer.thread?.id && answer.thread.id !== thread.id)
    ) {
      notFound();
    }

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
    const path = `/discourse/${thread.id}/answer/${answer.id}`;
    const parentPath = `/discourse/${thread.id}`;

    return buildAnswerMeta({
      answer: {
        id: answer.id,
        content: answer.content,
      },
      thread: {
        id: thread.id,
        title: thread.title,
        post: thread.post,
        support: thread.support,
        isScam: thread.isScam,
        tag: threadTag,
      },
      project,
      origin,
      path,
      parentPath,
    });
  } catch {
    console.error(
      '[Discourse Answer Meta] failed to load',
      JSON.stringify({ threadId, answerId }),
    );
    // If metadata fetch fails, return a minimal fallback pointing to the thread.
    const origin = getAppOrigin();
    const parentPath = `/discourse/${numericThreadId}`;
    const url = `${origin}${parentPath}`;
    return {
      title: 'Pensieve Discourse Answer',
      alternates: { canonical: url },
      openGraph: {
        title: 'Pensieve Discourse Answer',
        url,
        images: [buildAbsoluteUrl('/images/default-project.png', origin)],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Pensieve Discourse Answer',
        images: [buildAbsoluteUrl('/images/default-project.png', origin)],
      },
    } as Metadata;
  }
}

export default async function AnswerDetailRoute({
  params,
}: AnswerDetailRouteProps) {
  const { threadId, answerId } = await params;
  const numericThreadId = Number(threadId);
  const numericAnswerId = Number(answerId);

  if (!Number.isFinite(numericThreadId) || !Number.isFinite(numericAnswerId)) {
    notFound();
  }

  redirect(`/discourse/${threadId}?answerId=${numericAnswerId}`);
}
