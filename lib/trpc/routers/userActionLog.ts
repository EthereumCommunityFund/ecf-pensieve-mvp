import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { userActionLogs } from '@/lib/db/schema';

import { protectedProcedure, router } from '../server';

export const userActionLogRouter = router({
  track: protectedProcedure
    .input(
      z.object({
        action: z.string().min(1, 'action is required'),
        type: z.string().min(1, 'type is required'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const [log] = await ctx.db
          .insert(userActionLogs)
          .values({
            userId: ctx.user.id,
            action: input.action,
            type: input.type,
          })
          .returning({
            id: userActionLogs.id,
            createdAt: userActionLogs.createdAt,
            action: userActionLogs.action,
            type: userActionLogs.type,
          });

        return {
          id: log.id,
          createdAt: log.createdAt,
          action: log.action,
          type: log.type,
        };
      } catch (error) {
        console.error('[UserActionLog] Failed to record action', {
          userId: ctx.user.id,
          action: input.action,
          type: input.type,
          error,
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to record user action',
        });
      }
    }),
});
