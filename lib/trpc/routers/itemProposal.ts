import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { ESSENTIAL_ITEM_LIST, REWARD_PERCENT, WEIGHT } from '@/lib/constants';
import { itemProposals, profiles, projects } from '@/lib/db/schema';
import { POC_ITEMS } from '@/lib/pocItems';
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

      const isEssentialItem = ESSENTIAL_ITEM_LIST.some(
        (item) => item.key === input.key,
      );

      if (!isEssentialItem) {
        const existingProposal = await ctx.db.query.itemProposals.findFirst({
          where: and(
            eq(itemProposals.projectId, input.projectId),
            eq(itemProposals.key, input.key),
          ),
        });

        if (!existingProposal) {
          const userProfile = await ctx.db.query.profiles.findFirst({
            where: eq(profiles.userId, ctx.user.id),
          });

          const finalWeight =
            (userProfile?.weight ?? 0) +
            POC_ITEMS[input.key as keyof typeof POC_ITEMS]
              .accountability_metric *
              WEIGHT *
              REWARD_PERCENT;

          await ctx.db
            .update(profiles)
            .set({
              weight: finalWeight,
            })
            .where(eq(profiles.userId, ctx.user.id));
        }
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
