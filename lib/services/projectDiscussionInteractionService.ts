import { TRPCError } from '@trpc/server';
import {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNull,
  lt,
  sql,
  type SQL,
} from 'drizzle-orm';

import { REDRESSED_SUPPORT_THRESHOLD } from '@/constants/discourse';
import type { Database } from '@/lib/db';
import {
  profiles,
  projectDiscussionAnswerVotes,
  projectDiscussionAnswers,
  projectDiscussionComments,
  projectDiscussionSentiments,
  projectDiscussionThreads,
} from '@/lib/db/schema';
import { ensurePublishedProject } from '@/lib/services/projectGuards';

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
      creator: true,
    },
    where: and(
      eq(projectDiscussionAnswers.id, answerId),
      eq(projectDiscussionAnswers.isDeleted, false),
    ),
  });

  if (!answer) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Answer not found' });
  }

  const thread = await db.query.projectDiscussionThreads.findFirst({
    columns: {
      id: true,
      creator: true,
    },
    where: eq(projectDiscussionThreads.id, answer.threadId),
  });

  if (!thread) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Thread not found' });
  }

  return { ...answer, threadCreator: thread.creator };
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

export const getDiscussionAnswerById = async ({
  db,
  answerId,
  viewerId,
}: {
  db: Database;
  answerId: number;
  viewerId?: string | null;
}) => {
  const answer = await db.query.projectDiscussionAnswers.findFirst({
    where: and(
      eq(projectDiscussionAnswers.id, answerId),
      eq(projectDiscussionAnswers.isDeleted, false),
    ),
    with: {
      creator: {
        columns: {
          userId: true,
          name: true,
          avatarUrl: true,
        },
      },
      sentiments: true,
      thread: {
        columns: {
          id: true,
          projectId: true,
        },
      },
    },
  });

  if (!answer) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Answer not found' });
  }

  await ensurePublishedProject(db, answer.thread.projectId);

  if (!viewerId) {
    return answer;
  }

  const viewerVote = await db
    .select({
      answerId: projectDiscussionAnswerVotes.answerId,
    })
    .from(projectDiscussionAnswerVotes)
    .where(
      and(
        eq(projectDiscussionAnswerVotes.answerId, answerId),
        eq(projectDiscussionAnswerVotes.voter, viewerId),
      ),
    )
    .limit(1);

  return {
    ...answer,
    viewerHasSupported: viewerVote.length > 0,
  };
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
  viewerId?: string | null;
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
          asc(projectDiscussionComments.id),
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

  let viewerVotes = new Set<number>();
  if (input.viewerId && items.length) {
    const voteRows = await db
      .select({
        answerId: projectDiscussionAnswerVotes.answerId,
      })
      .from(projectDiscussionAnswerVotes)
      .where(
        and(
          eq(projectDiscussionAnswerVotes.voter, input.viewerId),
          inArray(
            projectDiscussionAnswerVotes.answerId,
            items.map((item) => item.id),
          ),
        ),
      );
    viewerVotes = new Set(voteRows.map((row) => row.answerId));
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

export const voteDiscussionAnswer = async ({
  db,
  userId,
  answerId,
}: {
  db: Database;
  userId: string;
  answerId: number;
}) => {
  const { threadId, threadCreator } = await ensureAnswerAvailable(db, answerId);

  const isThreadAuthor = threadCreator === userId;

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

    const existingAnswerVote =
      await tx.query.projectDiscussionAnswerVotes.findFirst({
        columns: {
          id: true,
          answerId: true,
        },
        where: and(
          eq(projectDiscussionAnswerVotes.answerId, answerId),
          eq(projectDiscussionAnswerVotes.voter, userId),
        ),
      });

    if (existingAnswerVote) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'User has already voted for this answer',
      });
    }

    const existingThreadVote =
      await tx.query.projectDiscussionAnswerVotes.findFirst({
        columns: {
          id: true,
          answerId: true,
        },
        where: and(
          eq(projectDiscussionAnswerVotes.voter, userId),
          eq(projectDiscussionAnswerVotes.threadId, threadId),
        ),
      });

    if (existingThreadVote) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'User has already supported another answer in this thread',
      });
    }

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

    const updatePayload: {
      support: SQL<unknown>;
      isThreadAuthorVoted?: boolean;
    } = {
      support: sql`${projectDiscussionAnswers.support} + ${weight}`,
    };

    if (isThreadAuthor) {
      updatePayload.isThreadAuthorVoted = true;
    }

    const [answer] = await tx
      .update(projectDiscussionAnswers)
      .set(updatePayload)
      .where(eq(projectDiscussionAnswers.id, answerId))
      .returning({
        id: projectDiscussionAnswers.id,
        support: projectDiscussionAnswers.support,
        isThreadAuthorVoted: projectDiscussionAnswers.isThreadAuthorVoted,
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
  const { threadId, threadCreator } = await ensureAnswerAvailable(db, answerId);

  const isThreadAuthor = threadCreator === userId;

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

    const updatePayload: {
      support: SQL<unknown>;
      isThreadAuthorVoted?: boolean;
    } = {
      support: sql`GREATEST(${projectDiscussionAnswers.support} - ${weight}, 0)`,
    };

    if (isThreadAuthor) {
      updatePayload.isThreadAuthorVoted = false;
    }

    const [answer] = await tx
      .update(projectDiscussionAnswers)
      .set(updatePayload)
      .where(eq(projectDiscussionAnswers.id, answerId))
      .returning({
        id: projectDiscussionAnswers.id,
        support: projectDiscussionAnswers.support,
        isThreadAuthorVoted: projectDiscussionAnswers.isThreadAuthorVoted,
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
  content: string;
} & (
  | {
      targetType: 'thread';
      targetId: number;
    }
  | {
      targetType: 'answer';
      targetId: number;
    }
  | {
      targetType: 'comment';
      targetId: number;
    }
);

export const createDiscussionComment = async ({
  db,
  userId,
  input,
}: {
  db: Database;
  userId: string;
  input: CreateCommentInput;
}) => {
  const { targetType, targetId, content } = input;

  const derived = await (async () => {
    if (targetType === 'thread') {
      await ensureThreadAvailable(db, targetId);
      return {
        threadId: targetId,
        answerId: null,
        parentId: null,
        rootCommentId: null,
      };
    }

    if (targetType === 'answer') {
      const answer = await ensureAnswerAvailable(db, targetId);

      return {
        threadId: answer.threadId,
        answerId: answer.id,
        parentId: null,
        rootCommentId: null,
      };
    }

    const parent = await ensureCommentAvailable(db, targetId);

    const parentThreadId =
      parent.threadId ??
      (parent.answerId
        ? (await ensureAnswerAvailable(db, parent.answerId)).threadId
        : null);

    if (!parentThreadId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Parent comment is missing thread context',
      });
    }

    return {
      threadId: parentThreadId,
      answerId: parent.answerId ?? null,
      parentId: targetId,
      rootCommentId: parent.commentId ?? parent.id,
    };
  })();

  const comment = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(projectDiscussionComments)
      .values({
        creator: userId,
        content,
        parentCommentId: derived.parentId,
        answerId: derived.answerId,
        threadId: derived.threadId,
        commentId: derived.rootCommentId,
      })
      .returning();

    return inserted;
  });

  return comment;
};

type ListCommentsInput = {
  threadId: number;
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
  const { threadId, cursor, limit } = input;
  await ensureThreadAvailable(db, threadId);

  const conditions: SQL<unknown>[] = [
    eq(projectDiscussionComments.isDeleted, false),
    eq(projectDiscussionComments.threadId, threadId),
    isNull(projectDiscussionComments.parentCommentId),
    isNull(projectDiscussionComments.answerId),
  ];

  if (cursor !== undefined) {
    conditions.push(lt(projectDiscussionComments.id, cursor));
  }

  const rootComments = await db.query.projectDiscussionComments.findMany({
    where: and(...conditions),
    orderBy: [
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
      childrenComments: {
        where: eq(projectDiscussionComments.isDeleted, false),
        orderBy: [
          asc(projectDiscussionComments.createdAt),
          asc(projectDiscussionComments.id),
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

  const hasNextPage = rootComments.length > limit;
  const items = hasNextPage ? rootComments.slice(0, limit) : rootComments;
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
