import { z } from 'zod';

import {
  createDiscussionAnswer,
  createDiscussionComment,
  listDiscussionAnswers,
  listDiscussionComments,
  setDiscussionSentiment,
  unvoteDiscussionAnswer,
  voteDiscussionAnswer,
} from '@/lib/services/projectDiscussionInteractionService';

import { protectedProcedure, publicProcedure, router } from '../server';

const TEXT_MAX_LENGTH = 20000;
const SENTIMENT_MAX_LENGTH = 50;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

const commentTargetSchema = z
  .object({
    threadId: z.number().optional(),
    answerId: z.number().optional(),
    parentCommentId: z.number().optional(),
  })
  .refine(
    (value) =>
      Boolean(value.threadId || value.answerId || value.parentCommentId),
    { message: 'Thread, answer, or parent comment is required' },
  );

export const projectDiscussionInteractionRouter = router({
  createAnswer: protectedProcedure
    .input(
      z.object({
        threadId: z.number(),
        content: z
          .string()
          .trim()
          .min(1, 'Content is required')
          .max(TEXT_MAX_LENGTH),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return createDiscussionAnswer({
        db: ctx.db,
        userId: ctx.user.id,
        input,
      });
    }),

  listAnswers: publicProcedure
    .input(
      z.object({
        threadId: z.number(),
        cursor: z.number().optional(),
        limit: z.number().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
        sortBy: z.enum(['recent', 'votes']).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return listDiscussionAnswers({
        db: ctx.db,
        input: {
          threadId: input.threadId,
          cursor: input.cursor,
          limit: input.limit ?? DEFAULT_PAGE_SIZE,
          sortBy: input.sortBy ?? 'recent',
          viewerId: ctx.user?.id ?? null,
        },
      });
    }),

  voteAnswer: protectedProcedure
    .input(
      z.object({
        answerId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return voteDiscussionAnswer({
        db: ctx.db,
        userId: ctx.user.id,
        answerId: input.answerId,
      });
    }),

  unvoteAnswer: protectedProcedure
    .input(
      z.object({
        answerId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return unvoteDiscussionAnswer({
        db: ctx.db,
        userId: ctx.user.id,
        answerId: input.answerId,
      });
    }),

  createComment: protectedProcedure
    .input(
      z
        .object({
          content: z
            .string()
            .trim()
            .min(1, 'Content is required')
            .max(TEXT_MAX_LENGTH),
        })
        .and(commentTargetSchema),
    )
    .mutation(async ({ ctx, input }) => {
      return createDiscussionComment({
        db: ctx.db,
        userId: ctx.user.id,
        input,
      });
    }),

  listComments: publicProcedure
    .input(
      z
        .object({
          cursor: z.number().optional(),
          limit: z
            .number()
            .min(1)
            .max(MAX_PAGE_SIZE)
            .default(DEFAULT_PAGE_SIZE),
        })
        .and(commentTargetSchema),
    )
    .query(async ({ ctx, input }) => {
      return listDiscussionComments({
        db: ctx.db,
        input: {
          threadId: input.threadId,
          answerId: input.answerId,
          parentCommentId: input.parentCommentId,
          cursor: input.cursor,
          limit: input.limit ?? DEFAULT_PAGE_SIZE,
        },
      });
    }),

  setSentiment: protectedProcedure
    .input(
      z
        .object({
          threadId: z.number().optional(),
          answerId: z.number().optional(),
          type: z
            .string()
            .trim()
            .min(1, 'Type is required')
            .max(SENTIMENT_MAX_LENGTH),
        })
        .refine(
          (value) => Boolean(value.threadId) !== Boolean(value.answerId),
          {
            message: 'Specify exactly one of threadId or answerId',
          },
        ),
    )
    .mutation(async ({ ctx, input }) => {
      const payload =
        input.threadId !== undefined
          ? { threadId: input.threadId, type: input.type }
          : { answerId: input.answerId!, type: input.type };

      return setDiscussionSentiment({
        db: ctx.db,
        userId: ctx.user.id,
        input: payload,
      });
    }),
});
