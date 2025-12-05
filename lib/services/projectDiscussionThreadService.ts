import { TRPCError } from '@trpc/server';
import { and, desc, eq, gt, inArray, lt, sql } from 'drizzle-orm';

import type { Database } from '@/lib/db';
import {
  profiles,
  projectDiscussionThreads,
  projectDiscussionVotes,
} from '@/lib/db/schema';
import { ensurePublishedProject } from '@/lib/services/projectGuards';

type CreateThreadInput = {
  projectId: number;
  title: string;
  post: string;
  category: string[];
  tags: string[];
  isScam: boolean;
};

const ensureDiscussionThreadAvailable = async (
  db: Database,
  threadId: number,
) => {
  const thread = await db.query.projectDiscussionThreads.findFirst({
    columns: {
      id: true,
    },
    where: eq(projectDiscussionThreads.id, threadId),
  });

  if (!thread) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Thread not found' });
  }

  return thread;
};

export const getDiscussionThreadById = async ({
  db,
  threadId,
  viewerId,
}: {
  db: Database;
  threadId: number;
  viewerId?: string | null;
}) => {
  const thread = await db.query.projectDiscussionThreads.findFirst({
    where: eq(projectDiscussionThreads.id, threadId),
    with: {
      creator: {
        columns: {
          userId: true,
          name: true,
          avatarUrl: true,
        },
      },
      sentiments: true,
    },
  });

  if (!thread) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Thread not found' });
  }

  await ensurePublishedProject(db, thread.projectId);

  if (!viewerId) {
    return thread;
  }

  const viewerVote = await db
    .select({
      threadId: projectDiscussionVotes.threadId,
    })
    .from(projectDiscussionVotes)
    .where(
      and(
        eq(projectDiscussionVotes.threadId, threadId),
        eq(projectDiscussionVotes.voter, viewerId),
      ),
    )
    .limit(1);

  return {
    ...thread,
    viewerHasSupported: viewerVote.length > 0,
  };
};

export const createDiscussionThread = async ({
  db,
  userId,
  input,
}: {
  db: Database;
  userId: string;
  input: CreateThreadInput;
}) => {
  await ensurePublishedProject(db, input.projectId);

  const [thread] = await db
    .insert(projectDiscussionThreads)
    .values({
      projectId: input.projectId,
      creator: userId,
      title: input.title,
      post: input.post,
      category: input.category,
      tags: input.tags,
      isScam: input.isScam,
    })
    .returning();

  return thread;
};

type ListThreadsInput = {
  projectId?: number;
  category: string[];
  tags: string[];
  isScam?: boolean;
  cursor?: number;
  limit: number;
  sortBy: 'recent' | 'votes';
  tab: 'all' | 'redressed' | 'unanswered';
};

export const listDiscussionThreads = async ({
  db,
  input,
  viewerId,
}: {
  db: Database;
  input: ListThreadsInput;
  viewerId?: string | null;
}) => {
  if (input.projectId !== undefined) {
    await ensurePublishedProject(db, input.projectId);
  }

  const conditions = input.projectId
    ? [eq(projectDiscussionThreads.projectId, input.projectId)]
    : [];

  if (input.cursor) {
    conditions.push(lt(projectDiscussionThreads.id, input.cursor));
  }

  if (input.isScam !== undefined) {
    conditions.push(eq(projectDiscussionThreads.isScam, input.isScam));
  }

  if (input.category.length > 0) {
    conditions.push(
      sql`${projectDiscussionThreads.category} && ARRAY[${sql.join(
        input.category.map((value) => sql`${value}`),
        sql`, `,
      )}]`,
    );
  }

  if (input.tags.length > 0) {
    conditions.push(
      sql`${projectDiscussionThreads.tags} && ARRAY[${sql.join(
        input.tags.map((tag) => sql`${tag}`),
        sql`, `,
      )}]`,
    );
  }

  if (input.tab === 'unanswered') {
    conditions.push(eq(projectDiscussionThreads.answerCount, 0));
  } else if (input.tab === 'redressed') {
    conditions.push(gt(projectDiscussionThreads.redressedAnswerCount, 0));
  }

  const whereCondition = conditions.length ? and(...conditions) : undefined;

  const orderBy =
    input.sortBy === 'votes'
      ? [
          desc(projectDiscussionThreads.support),
          desc(projectDiscussionThreads.createdAt),
          desc(projectDiscussionThreads.id),
        ]
      : [
          desc(projectDiscussionThreads.createdAt),
          desc(projectDiscussionThreads.id),
        ];

  const results = await db.query.projectDiscussionThreads.findMany({
    where: whereCondition,
    orderBy,
    limit: input.limit + 1,
    with: {
      creator: {
        columns: {
          userId: true,
          name: true,
          avatarUrl: true,
        },
      },
      sentiments: true,
    },
  });

  const hasNextPage = results.length > input.limit;
  const items = hasNextPage ? results.slice(0, input.limit) : results;

  let viewerVotes = new Set<number>();
  if (viewerId && items.length) {
    const voteRows = await db
      .select({
        threadId: projectDiscussionVotes.threadId,
      })
      .from(projectDiscussionVotes)
      .where(
        and(
          eq(projectDiscussionVotes.voter, viewerId),
          inArray(
            projectDiscussionVotes.threadId,
            items.map((item) => item.id),
          ),
        ),
      );
    viewerVotes = new Set(voteRows.map((row) => row.threadId));
  }

  const hydratedItems = items.map((item) => ({
    ...item,
    viewerHasSupported: viewerVotes.has(item.id),
  }));
  const nextCursor = hasNextPage ? (items[items.length - 1]?.id ?? null) : null;

  return {
    items: hydratedItems,
    nextCursor,
    hasNextPage,
  };
};

export const voteDiscussionThread = async ({
  db,
  userId,
  threadId,
}: {
  db: Database;
  userId: string;
  threadId: number;
}) => {
  await ensureDiscussionThreadAvailable(db, threadId);

  const user = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
    columns: {
      weight: true,
    },
  });

  const updated = await db.transaction(async (tx) => {
    const insertedVotes = await tx
      .insert(projectDiscussionVotes)
      .values({
        threadId,
        voter: userId,
        weight: user?.weight ?? 0,
      })
      .onConflictDoNothing()
      .returning({
        id: projectDiscussionVotes.id,
      });

    if (insertedVotes.length === 0) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'User has already voted for this thread',
      });
    }

    const [thread] = await tx
      .update(projectDiscussionThreads)
      .set({
        support: sql`${projectDiscussionThreads.support} + ${user?.weight ?? 0}`,
      })
      .where(eq(projectDiscussionThreads.id, threadId))
      .returning({
        id: projectDiscussionThreads.id,
        support: projectDiscussionThreads.support,
      });

    return thread;
  });

  return updated;
};

export const unvoteDiscussionThread = async ({
  db,
  userId,
  threadId,
}: {
  db: Database;
  userId: string;
  threadId: number;
}) => {
  await ensureDiscussionThreadAvailable(db, threadId);

  const updated = await db.transaction(async (tx) => {
    const deletedVotes = await tx
      .delete(projectDiscussionVotes)
      .where(
        and(
          eq(projectDiscussionVotes.threadId, threadId),
          eq(projectDiscussionVotes.voter, userId),
        ),
      )
      .returning({
        id: projectDiscussionVotes.id,
        weight: projectDiscussionVotes.weight,
      });

    if (deletedVotes.length === 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User has not voted for this thread',
      });
    }

    const weight = deletedVotes[0]?.weight ?? 0;

    const [thread] = await tx
      .update(projectDiscussionThreads)
      .set({
        support: sql`${projectDiscussionThreads.support} - ${weight}`,
      })
      .where(eq(projectDiscussionThreads.id, threadId))
      .returning({
        id: projectDiscussionThreads.id,
        support: projectDiscussionThreads.support,
      });

    return thread;
  });

  return updated;
};
