import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import {
  itemProposals,
  profiles,
  projects,
  voteRecords,
} from '@/lib/db/schema';
import { logUserActivity } from '@/lib/services/activeLogsService';
import {
  addRewardNotification,
  createRewardNotification,
} from '@/lib/services/notification';
import {
  calculateReward,
  handleVoteRecord,
  isEssentialItem,
} from '@/lib/utils/itemProposalUtils';

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

      return await ctx.db.transaction(async (tx) => {
        const [itemProposal] = await tx
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
          items: [{ field: input.key }],
        });

        if (isEssentialItem(input.key)) {
          return itemProposal;
        }

        const [existingProposal, userProfile, voteRecord] = await Promise.all([
          tx.query.itemProposals.findFirst({
            where: and(
              eq(itemProposals.projectId, input.projectId),
              eq(itemProposals.key, input.key),
            ),
          }),
          tx.query.profiles.findFirst({
            where: eq(profiles.userId, ctx.user.id),
          }),
          tx.query.voteRecords.findFirst({
            where: and(
              eq(voteRecords.creator, ctx.user.id),
              eq(voteRecords.projectId, input.projectId),
              eq(voteRecords.key, input.key),
            ),
          }),
        ]);

        if (!existingProposal) {
          const reward = calculateReward(input.key);
          const finalWeight = (userProfile?.weight ?? 0) + reward;

          await Promise.all([
            tx
              .update(profiles)
              .set({ weight: finalWeight })
              .where(eq(profiles.userId, ctx.user.id)),

            addRewardNotification(
              createRewardNotification.createProposal(
                ctx.user.id,
                input.projectId,
                itemProposal.id,
                reward,
              ),
              tx,
            ),

            handleVoteRecord(tx, {
              userId: ctx.user.id,
              projectId: input.projectId,
              itemProposalId: itemProposal.id,
              key: input.key,
              weight: finalWeight,
              existingVoteRecord: voteRecord,
            }),
          ]);
        }

        return itemProposal;
      });
    }),
});
