import { z } from 'zod';

import DiscourseShareService from '@/lib/services/discourseShare';

import { publicProcedure, router } from '../server';

const ensureInput = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('thread'),
    threadId: z.number(),
  }),
  z.object({
    type: z.literal('answer'),
    threadId: z.number(),
    answerId: z.number(),
  }),
]);

export const discourseShareRouter = router({
  ensure: publicProcedure
    .input(ensureInput)
    .mutation(async ({ ctx, input }) => {
      const entity =
        input.type === 'thread'
          ? ({ kind: 'thread', threadId: input.threadId } as const)
          : ({
              kind: 'answer',
              threadId: input.threadId,
              answerId: input.answerId,
            } as const);

      const ensured = await DiscourseShareService.ensureShareLink({
        entity,
        createdBy: ctx.user?.id,
      });

      return {
        ...ensured,
      };
    }),
});
