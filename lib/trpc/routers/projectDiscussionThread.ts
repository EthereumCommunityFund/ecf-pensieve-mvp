import { z } from 'zod';

import {
  createDiscussionThread,
  getDiscussionThreadById,
  getDiscussionThreadStats,
  listDiscussionThreads,
  unvoteDiscussionThread,
  voteDiscussionThread,
} from '@/lib/services/projectDiscussionThreadService';
import { normalizeStringArray } from '@/lib/utils';

import { protectedProcedure, publicProcedure, router } from '../server';

const TITLE_MAX_LENGTH = 200;
const POST_MAX_LENGTH = 20000;
const MAX_CATEGORIES = 10;
const MAX_TAGS = 20;

const createThreadInput = z.object({
  projectId: z.number(),
  title: z.string().trim().min(1, 'Title is required').max(TITLE_MAX_LENGTH),
  post: z.string().trim().min(1, 'Post is required').max(POST_MAX_LENGTH),
  category: z
    .array(z.string().trim().min(1, 'Category cannot be empty'))
    .max(MAX_CATEGORIES)
    .default([]),
  tags: z
    .array(z.string().trim().min(1, 'Tag cannot be empty'))
    .max(MAX_TAGS)
    .default([]),
  isScam: z.boolean().optional().default(false),
});

const listThreadsInput = z.object({
  projectId: z.number().optional(),
  category: z.array(z.string().trim().min(1)).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  isScam: z.boolean().optional(),
  cursor: z.number().optional(),
  limit: z.number().min(1).max(50).default(20),
  sortBy: z.enum(['recent', 'votes']).optional(),
  tab: z.enum(['all', 'redressed', 'unanswered']).optional().default('all'),
});

export const projectDiscussionThreadRouter = router({
  createThread: protectedProcedure
    .input(createThreadInput)
    .mutation(async ({ ctx, input }) => {
      const category = normalizeStringArray(input.category);
      const tags = normalizeStringArray(input.tags);

      const thread = await createDiscussionThread({
        db: ctx.db,
        userId: ctx.user.id,
        input: {
          projectId: input.projectId,
          title: input.title,
          post: input.post,
          category,
          tags,
          isScam: input.isScam ?? false,
        },
      });

      return thread;
    }),

  listThreads: publicProcedure
    .input(listThreadsInput)
    .query(async ({ ctx, input }) => {
      const category = normalizeStringArray(input.category);
      const tags = normalizeStringArray(input.tags);
      const limit = input.limit ?? 20;
      return listDiscussionThreads({
        db: ctx.db,
        input: {
          projectId: input.projectId,
          category,
          tags,
          isScam: input.isScam,
          cursor: input.cursor,
          limit,
          sortBy: input.sortBy ?? 'recent',
          tab: input.tab ?? 'all',
        },
        viewerId: ctx.user?.id ?? null,
      });
    }),

  getProjectStats: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getDiscussionThreadStats({
        db: ctx.db,
        projectId: input.projectId,
      });
    }),

  getThreadById: publicProcedure
    .input(z.object({ threadId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getDiscussionThreadById({
        db: ctx.db,
        threadId: input.threadId,
        viewerId: ctx.user?.id ?? null,
      });
    }),

  voteThread: protectedProcedure
    .input(
      z.object({
        threadId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return voteDiscussionThread({
        db: ctx.db,
        userId: ctx.user.id,
        threadId: input.threadId,
      });
    }),

  unvoteThread: protectedProcedure
    .input(
      z.object({
        threadId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return unvoteDiscussionThread({
        db: ctx.db,
        userId: ctx.user.id,
        threadId: input.threadId,
      });
    }),
});
