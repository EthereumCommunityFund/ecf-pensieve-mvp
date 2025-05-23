import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { itemProposals, projects } from '@/lib/db/schema';
import { logUserActivity } from '@/lib/services/activeLogsService';

import { protectedProcedure, router } from '../server';

export const itemProposalRouter = router({
  createItemProposal: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        key: z.string().min(1, 'Key cannot be empty'),
        value: z.any(),
        ref: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.query.projects.findFirst({
        where: eq(projects.id, input.projectId),
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      const [itemProposal] = await ctx.db
        .insert(itemProposals)
        .values({
          ...input,
          creator: ctx.user.id,
        })
        .returning();

      if (!itemProposal) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create item proposal',
        });
      }

      logUserActivity.itemProposal.create({
        userId: ctx.user.id,
        targetId: itemProposal.id,
        projectId: itemProposal.projectId,
        items: [
          {
            field: input.key,
          },
        ],
      });

      return itemProposal;
    }),
});
