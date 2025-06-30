import { TRPCError } from '@trpc/server';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';

import {
  itemProposals,
  profiles,
  projects,
  ranks,
  voteRecords,
} from '@/lib/db/schema';
import { logUserActivity } from '@/lib/services/activeLogsService';
import {
  addRewardNotification,
  createRewardNotification,
} from '@/lib/services/notification';
import { calculateReward } from '@/lib/utils/itemProposalUtils';
import { calculatePublishedGenesisWeight } from '@/lib/utils/rankUtils';

import { protectedProcedure, router } from '../server';

import { voteRouter } from './vote';

export const itemProposalRouter = router({
  createItemProposal: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        key: z.string().min(1, 'Key cannot be empty'),
        value: z.any(),
        ref: z.string().optional(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const project = await ctx.db.query.projects.findFirst({
          where: eq(projects.id, input.projectId),
        });

        if (!project) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Project not found',
          });
        }

        const [existingProposal, userProfile, voteRecord] = await Promise.all([
          ctx.db.query.itemProposals.findFirst({
            where: and(
              eq(itemProposals.projectId, input.projectId),
              eq(itemProposals.key, input.key),
            ),
          }),
          ctx.db.query.profiles.findFirst({
            where: eq(profiles.userId, ctx.user.id),
          }),
          ctx.db.query.voteRecords.findFirst({
            where: and(
              eq(voteRecords.creator, ctx.user.id),
              eq(voteRecords.projectId, input.projectId),
              eq(voteRecords.key, input.key),
              isNull(voteRecords.proposalId),
            ),
          }),
        ]);

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

          const caller = voteRouter.createCaller({
            ...ctx,
            db: tx as any,
          });

          if (voteRecord) {
            await caller.switchItemProposalVote({
              itemProposalId: itemProposal.id,
              key: input.key,
            });
          } else {
            await caller.createItemProposalVote({
              itemProposalId: itemProposal.id,
              key: input.key,
            });
          }

          if (!existingProposal) {
            const reward = calculateReward(input.key);
            const finalWeight = (userProfile?.weight ?? 0) + reward;
            const hasProposalKeys = new Set([
              ...project.hasProposalKeys,
              input.key,
            ]);
            const updatedHasProposalKeys = Array.from(hasProposalKeys);
            const newPublishedGenesisWeight = calculatePublishedGenesisWeight(
              updatedHasProposalKeys,
            );

            const updatePromises = [
              tx
                .update(profiles)
                .set({ weight: finalWeight })
                .where(eq(profiles.userId, ctx.user.id)),

              tx
                .update(projects)
                .set({
                  hasProposalKeys: updatedHasProposalKeys,
                })
                .where(eq(projects.id, input.projectId)),

              tx
                .update(ranks)
                .set({ publishedGenesisWeight: newPublishedGenesisWeight })
                .where(eq(ranks.projectId, input.projectId)),

              addRewardNotification(
                createRewardNotification.createItemProposal(
                  ctx.user.id,
                  input.projectId,
                  itemProposal.id,
                  reward,
                ),
                tx,
              ),

              logUserActivity.itemProposal.create(
                {
                  userId: ctx.user.id,
                  targetId: itemProposal.id,
                  projectId: itemProposal.projectId,
                  items: [{ field: input.key }],
                },
                tx,
              ),
            ];

            await Promise.all(updatePromises);
          } else {
            logUserActivity.itemProposal.update(
              {
                userId: ctx.user.id,
                targetId: itemProposal.id,
                projectId: itemProposal.projectId,
                items: [{ field: input.key }],
              },
              tx,
            );
          }

          return itemProposal;
        });
      } catch (error) {
        console.error('Error in createItemProposal:', {
          userId: ctx.user.id,
          projectId: input.projectId,
          key: input.key,
          value: input.value,
          ref: input.ref,
          reason: input.reason,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create item proposal',
          cause: error,
        });
      }
    }),
});
