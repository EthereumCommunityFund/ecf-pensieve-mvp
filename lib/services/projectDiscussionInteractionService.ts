import { TRPCError } from '@trpc/server';
import { and, asc, desc, eq, isNull, lt, or, sql, type SQL } from 'drizzle-orm';

import type { Database } from '@/lib/db';
import {
  profiles,
  projectDiscussionAnswerVotes,
  projectDiscussionAnswers,
  projectDiscussionComments,
  projectDiscussionSentiments,
  projectDiscussionThreads,
} from '@/lib/db/schema';

const REDRESSED_SUPPORT_THRESHOLD = 9000;

const ensureThreadAvailable = async (db: Database, threadId: number) => {
  const thread = await db.query.projectDiscussionThreads.findFirst({
    columns: {
      id: true,
      projectId: true,
    },
    where: eq(projectDiscussionThreads.id, threadId),
  });

  if (!thread) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Thread not found' });
  }

  return thread;
};

const ensureAnswerAvailable = async (db: Database, answerId: number) => {
  const answer = await db.query.projectDiscussionAnswers.findFirst({
    columns: {
      id: true,
      threadId: true,
      isDeleted: true,
    },
    where: and(
      eq(projectDiscussionAnswers.id, answerId),
      eq(projectDiscussionAnswers.isDeleted, false),
    ),
  });

  if (!answer) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Answer not found' });
  }

  return answer;
};

const ensureCommentAvailable = async (db: Database, commentId: number) => {
  const comment = await db.query.projectDiscussionComments.findFirst({
    columns: {
      id: true,
      threadId: true,
      answerId: true,
      commentId: true,
      isDeleted: true,
    },
    where: and(
      eq(projectDiscussionComments.id, commentId),
      eq(projectDiscussionComments.isDeleted, false),
    ),
  });

  if (!comment) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Comment not found' });
  }

  return comment;
};

type CreateAnswerInput = {
  threadId: number;
  content: string;
};

export const createDiscussionAnswer = async ({
  db,
  userId,
  input,
}: {
  db: Database;
  userId: string;
  input: CreateAnswerInput;
}) => {
  const { threadId, content } = input;
  await ensureThreadAvailable(db, threadId);

  const updated = await db.transaction(async (tx) => {
    const [answer] = await tx
      .insert(projectDiscussionAnswers)
      .values({
        threadId,
        creator: userId,
        content,
      })
      .returning();

    await tx
      .update(projectDiscussionThreads)
      .set({
        answerCount: sql`${projectDiscussionThreads.answerCount} + 1`,
      })
      .where(eq(projectDiscussionThreads.id, threadId));

    return answer;
  });

  return updated;
};

type ListAnswersInput = {
  threadId: number;
  cursor?: number;
  limit: number;
  sortBy?: 'recent' | 'votes';
};

export const listDiscussionAnswers = async ({
  db,
  input,
}: {
  db: Database;
  input: ListAnswersInput;
}) => {
  await ensureThreadAvailable(db, input.threadId);

  const conditions = [
    eq(projectDiscussionAnswers.threadId, input.threadId),
    eq(projectDiscussionAnswers.isDeleted, false),
  ];

  if (input.cursor) {
    conditions.push(lt(projectDiscussionAnswers.id, input.cursor));
  }

  const orderBy =
    input.sortBy === 'votes'
      ? [
          desc(projectDiscussionAnswers.support),
          desc(projectDiscussionAnswers.createdAt),
          desc(projectDiscussionAnswers.id),
        ]
      : [
          desc(projectDiscussionAnswers.createdAt),
          desc(projectDiscussionAnswers.id),
        ];

  const results = await db.query.projectDiscussionAnswers.findMany({
    where: and(...conditions),
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
      comments: {
        where: eq(projectDiscussionComments.isDeleted, false),
        orderBy: [
          asc(projectDiscussionComments.createdAt),
          desc(projectDiscussionComments.id),
        ],
        with: {
          creator: {
            columns: {
              userId: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
      sentiments: true,
    },
  });

  const hasNextPage = results.length > input.limit;
  const items = hasNextPage ? results.slice(0, input.limit) : results;
  const nextCursor = hasNextPage ? (items[items.length - 1]?.id ?? null) : null;

  return {
    items,
    nextCursor,
    hasNextPage,
  };
};

export const voteDiscussionAnswer = async ({
  db,
  userId,
  answerId,
}: {
  db: Database;
  userId: string;
  answerId: number;
}) => {
  const { threadId } = await ensureAnswerAvailable(db, answerId);

  const user = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
    columns: {
      weight: true,
    },
  });

  const weight = user?.weight ?? 0;

  const updated = await db.transaction(async (tx) => {
    const existingSupport =
      (
        await tx.query.projectDiscussionAnswers.findFirst({
          columns: {
            support: true,
          },
          where: eq(projectDiscussionAnswers.id, answerId),
        })
      )?.support ?? 0;

    const insertedVotes = await tx
      .insert(projectDiscussionAnswerVotes)
      .values({
        answerId,
        voter: userId,
        weight,
        threadId,
      })
      .onConflictDoNothing()
      .returning({
        id: projectDiscussionAnswerVotes.id,
      });

    if (insertedVotes.length === 0) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'User has already voted',
      });
    }

    const [answer] = await tx
      .update(projectDiscussionAnswers)
      .set({
        support: sql`${projectDiscussionAnswers.support} + ${weight}`,
      })
      .where(eq(projectDiscussionAnswers.id, answerId))
      .returning({
        id: projectDiscussionAnswers.id,
        support: projectDiscussionAnswers.support,
      });

    const crossedToRedressed =
      existingSupport <= REDRESSED_SUPPORT_THRESHOLD &&
      answer.support > REDRESSED_SUPPORT_THRESHOLD;

    if (crossedToRedressed) {
      await tx
        .update(projectDiscussionThreads)
        .set({
          redressedAnswerCount: sql`${projectDiscussionThreads.redressedAnswerCount} + 1`,
        })
        .where(eq(projectDiscussionThreads.id, threadId));
    }

    return answer;
  });

  return updated;
};

export const unvoteDiscussionAnswer = async ({
  db,
  userId,
  answerId,
}: {
  db: Database;
  userId: string;
  answerId: number;
}) => {
  const { threadId } = await ensureAnswerAvailable(db, answerId);

  const updated = await db.transaction(async (tx) => {
    const existingSupport =
      (
        await tx.query.projectDiscussionAnswers.findFirst({
          columns: {
            support: true,
          },
          where: eq(projectDiscussionAnswers.id, answerId),
        })
      )?.support ?? 0;

    const deletedVotes = await tx
      .delete(projectDiscussionAnswerVotes)
      .where(
        and(
          eq(projectDiscussionAnswerVotes.answerId, answerId),
          eq(projectDiscussionAnswerVotes.voter, userId),
        ),
      )
      .returning({
        id: projectDiscussionAnswerVotes.id,
        weight: projectDiscussionAnswerVotes.weight,
      });

    if (deletedVotes.length === 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User has not voted for this answer',
      });
    }

    const weight = deletedVotes[0]?.weight ?? 0;

    const [answer] = await tx
      .update(projectDiscussionAnswers)
      .set({
        support: sql`GREATEST(${projectDiscussionAnswers.support} - ${weight}, 0)`,
      })
      .where(eq(projectDiscussionAnswers.id, answerId))
      .returning({
        id: projectDiscussionAnswers.id,
        support: projectDiscussionAnswers.support,
      });

    const crossedBelowThreshold =
      existingSupport > REDRESSED_SUPPORT_THRESHOLD &&
      answer.support <= REDRESSED_SUPPORT_THRESHOLD;

    if (crossedBelowThreshold) {
      await tx
        .update(projectDiscussionThreads)
        .set({
          redressedAnswerCount: sql`GREATEST(${projectDiscussionThreads.redressedAnswerCount} - 1, 0)`,
        })
        .where(eq(projectDiscussionThreads.id, threadId));
    }

    return answer;
  });

  return updated;
};

type CreateCommentInput = {
  commentId?: number;
  threadId?: number;
  answerId?: number;
  parentCommentId?: number;
  content: string;
};

export const createDiscussionComment = async ({
  db,
  userId,
  input,
}: {
  db: Database;
  userId: string;
  input: CreateCommentInput;
}) => {
  const { threadId, answerId, parentCommentId, content, commentId } = input;

  if (!threadId && !answerId && !parentCommentId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Thread, answer, or parent comment is required',
    });
  }

  if (parentCommentId) {
    const parent = await ensureCommentAvailable(db, parentCommentId);
    if (!commentId && !answerId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Comment ID or answer ID is required',
      });
    }
    if (commentId && commentId !== parent.commentId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Comment ID does not match parent comment',
      });
    }
    if (answerId && answerId !== parent.answerId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Answer ID does not match parent comment',
      });
    }
  }

  if (answerId) {
    await ensureAnswerAvailable(db, answerId);
  }
  if (threadId) {
    await ensureThreadAvailable(db, threadId);
  }

  const comment = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(projectDiscussionComments)
      .values({
        creator: userId,
        content,
        parentCommentId: parentCommentId ?? null,
        answerId: answerId ?? null,
        threadId: threadId ?? null,
        commentId: commentId ?? null,
      })
      .returning();

    return inserted;
  });

  return comment;
};

type ListCommentsInput = {
  threadId?: number;
  answerId?: number;
  parentCommentId?: number;
  cursor?: number;
  limit: number;
};

export const listDiscussionComments = async ({
  db,
  input,
}: {
  db: Database;
  input: ListCommentsInput;
}) => {
  const { threadId, answerId, parentCommentId, cursor, limit } = input;
  if (!threadId && !answerId && !parentCommentId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Thread, answer, or parent comment is required',
    });
  }

  const conditions: SQL<unknown>[] = [
    eq(projectDiscussionComments.isDeleted, false),
  ];

  if (threadId) {
    await ensureThreadAvailable(db, threadId);
    conditions.push(eq(projectDiscussionComments.threadId, threadId));
  }

  if (answerId) {
    await ensureAnswerAvailable(db, answerId);
    conditions.push(eq(projectDiscussionComments.answerId, answerId));
  }

  if (parentCommentId) {
    await ensureCommentAvailable(db, parentCommentId);
    conditions.push(
      eq(projectDiscussionComments.parentCommentId, parentCommentId),
    );
  }

  if (parentCommentId !== undefined) {
    const rootParentCondition = and(
      eq(projectDiscussionComments.id, parentCommentId),
      isNull(projectDiscussionComments.parentCommentId),
    )!;

    const parentCondition = or(
      eq(projectDiscussionComments.parentCommentId, parentCommentId),
      rootParentCondition,
    )!;

    conditions.push(parentCondition);
  }

  if (cursor) {
    conditions.push(lt(projectDiscussionComments.id, cursor));
  }

  const results = await db.query.projectDiscussionComments.findMany({
    where: and(...conditions),
    orderBy: [
      asc(projectDiscussionComments.parentCommentId),
      desc(projectDiscussionComments.createdAt),
      desc(projectDiscussionComments.id),
    ],
    limit: limit + 1,
    with: {
      creator: {
        columns: {
          userId: true,
          name: true,
          avatarUrl: true,
        },
      },
      comments: {
        where: eq(projectDiscussionComments.isDeleted, false),
        orderBy: [
          asc(projectDiscussionComments.createdAt),
          desc(projectDiscussionComments.id),
        ],
        with: {
          creator: {
            columns: {
              userId: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  const hasNextPage = results.length > input.limit;
  const items = hasNextPage ? results.slice(0, input.limit) : results;
  const nextCursor = hasNextPage ? (items[items.length - 1]?.id ?? null) : null;

  return {
    items,
    nextCursor,
    hasNextPage,
  };
};

type SentimentTargetInput =
  | { threadId: number; answerId?: never }
  | { threadId?: never; answerId: number };

type SetSentimentInput = SentimentTargetInput & {
  type: string;
};

export const setDiscussionSentiment = async ({
  db,
  userId,
  input,
}: {
  db: Database;
  userId: string;
  input: SetSentimentInput;
}) => {
  const { threadId, answerId, type } = input;

  if (threadId) {
    await ensureThreadAvailable(db, threadId);
  }

  if (answerId) {
    await ensureAnswerAvailable(db, answerId);
  }

  const payload =
    threadId !== undefined
      ? {
          threadId,
          creator: userId,
          type,
        }
      : {
          answerId,
          creator: userId,
          type,
        };

  const conflictTarget =
    threadId !== undefined
      ? [
          projectDiscussionSentiments.threadId,
          projectDiscussionSentiments.creator,
        ]
      : [
          projectDiscussionSentiments.answerId,
          projectDiscussionSentiments.creator,
        ];

  const [sentiment] = await db
    .insert(projectDiscussionSentiments)
    .values(payload)
    .onConflictDoUpdate({
      target: conflictTarget,
      set: {
        type,
      },
    })
    .returning();

  return sentiment;
};
