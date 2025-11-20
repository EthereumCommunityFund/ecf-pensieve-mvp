import { TRPCError } from '@trpc/server';
import { and, desc, eq, lt, sql } from 'drizzle-orm';

import type { Database } from '@/lib/db';
import { projectDiscussionThreads, projects } from '@/lib/db/schema';

const ensurePublishedProject = async (db: Database, projectId: number) => {
  const project = await db.query.projects.findFirst({
    columns: {
      id: true,
      isPublished: true,
    },
    where: eq(projects.id, projectId),
  });

  if (!project) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Project not found',
    });
  }

  if (!project.isPublished) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Project is not published',
    });
  }
};

type CreateThreadInput = {
  projectId: number;
  title: string;
  post: string;
  category: string[];
  tags: string[];
  isScam: boolean;
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
  projectId: number;
  category: string[];
  tags: string[];
  isScam?: boolean;
  cursor?: number;
  limit: number;
};

export const listDiscussionThreads = async ({
  db,
  input,
}: {
  db: Database;
  input: ListThreadsInput;
}) => {
  await ensurePublishedProject(db, input.projectId);

  const conditions = [eq(projectDiscussionThreads.projectId, input.projectId)];

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

  const whereCondition = and(...conditions);

  const results = await db.query.projectDiscussionThreads.findMany({
    where: whereCondition,
    orderBy: [
      desc(projectDiscussionThreads.createdAt),
      desc(projectDiscussionThreads.id),
    ],
    limit: input.limit + 1,
    with: {
      creator: {
        columns: {
          userId: true,
          name: true,
          avatarUrl: true,
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
