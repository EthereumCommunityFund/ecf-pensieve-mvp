import { TRPCError } from '@trpc/server';
import { and, eq, isNull, ne } from 'drizzle-orm';
import { z } from 'zod';

import {
  itemProposals,
  profiles,
  projectLogs,
  projects,
  proposals,
  voteRecords,
} from '@/lib/db/schema';
import { logUserActivity } from '@/lib/services/activeLogsService';
import {
  addNotification,
  createNotification,
} from '@/lib/services/notification';
import {
  checkNeedQuorum,
  handleOriginalProposalUpdate,
  handleVoteRecord,
  processItemProposalUpdate,
  processItemProposalVoteResult,
} from '@/lib/utils/itemProposalUtils';

import { protectedProcedure, publicProcedure, router } from '../server';

export const voteRouter = router({
  createVote: protectedProcedure
    .input(
      z.object({
        proposalId: z.number(),
        key: z.string().min(1, 'Key cannot be empty'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { proposalId, key } = input;

        const [proposalWithProject, userProfile, existingVote] =
          await Promise.all([
            ctx.db.query.proposals.findFirst({
              where: eq(proposals.id, proposalId),
              with: {
                project: true,
              },
            }),
            ctx.db.query.profiles.findFirst({
              where: eq(profiles.userId, ctx.user.id),
            }),
            ctx.db.query.voteRecords.findFirst({
              where: and(
                eq(voteRecords.creator, ctx.user.id),
                eq(voteRecords.key, key),
                eq(voteRecords.proposalId, proposalId),
              ),
            }),
          ]);

        if (!proposalWithProject) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Proposal not found',
          });
        }

        if (!proposalWithProject.project) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Associated project not found',
          });
        }

        const projectId = proposalWithProject.projectId;

        if (proposalWithProject.project.isPublished) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot vote on proposals for published projects',
          });
        }

        if (existingVote) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'You have already voted for this key in this proposal',
          });
        }

        const otherVote = await ctx.db.query.voteRecords.findFirst({
          where: and(
            eq(voteRecords.creator, ctx.user.id),
            eq(voteRecords.key, key),
            eq(voteRecords.projectId, projectId),
            ne(voteRecords.proposalId, proposalId),
          ),
        });

        if (otherVote) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
              'You have already voted for the same key in another proposal of this project',
          });
        }

        return await ctx.db.transaction(async (tx) => {
          const [vote] = await tx
            .insert(voteRecords)
            .values({
              key,
              proposalId,
              creator: ctx.user.id,
              weight: userProfile?.weight ?? 0,
              projectId,
            })
            .returning();

          logUserActivity.vote.create(
            {
              userId: ctx.user.id,
              targetId: vote.id,
              projectId,
              items: [{ field: key }],
              proposalCreatorId: proposalWithProject.creator,
            },
            tx,
          );

          if (ctx.user.id !== proposalWithProject.creator) {
            await addNotification(
              createNotification.proposalSupported(
                proposalWithProject.creator,
                projectId,
                proposalId,
                ctx.user.id,
              ),
              tx,
            );
          }

          return vote;
        });
      } catch (error) {
        console.error('Error in createVote:', {
          userId: ctx.user.id,
          proposalId: input.proposalId,
          key: input.key,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });

        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create vote',
          cause: error,
        });
      }
    }),

  switchVote: protectedProcedure
    .input(
      z.object({
        proposalId: z.number(),
        key: z.string().min(1, 'Key cannot be empty'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { proposalId, key } = input;

        const targetProposal = await ctx.db.query.proposals.findFirst({
          where: eq(proposals.id, proposalId),
          with: {
            project: true,
          },
        });

        if (!targetProposal) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Target proposal not found',
          });
        }

        if (!targetProposal.project) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Associated project not found',
          });
        }

        if (targetProposal.project.isPublished) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot switch votes on proposals for published projects',
          });
        }

        const [userProfile, voteToSwitch] = await Promise.all([
          ctx.db.query.profiles.findFirst({
            where: eq(profiles.userId, ctx.user.id),
          }),
          ctx.db.query.voteRecords.findFirst({
            where: and(
              eq(voteRecords.creator, ctx.user.id),
              eq(voteRecords.key, key),
              eq(voteRecords.projectId, targetProposal.projectId),
            ),
            with: {
              proposal: true,
            },
          }),
        ]);

        if (!voteToSwitch) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No conflicting vote found to switch',
          });
        }

        if (voteToSwitch.proposalId === proposalId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
              'You have already voted for this key in the target proposal',
          });
        }

        return await ctx.db.transaction(async (tx) => {
          const [updatedVote] = await tx
            .update(voteRecords)
            .set({
              proposalId,
              weight: userProfile?.weight ?? 0,
            })
            .where(eq(voteRecords.id, voteToSwitch.id))
            .returning();

          logUserActivity.vote.update(
            {
              userId: ctx.user.id,
              targetId: updatedVote.id,
              projectId: targetProposal.projectId,
              items: [{ field: key }],
              proposalCreatorId: targetProposal.creator,
            },
            tx,
          );

          if (ctx.user.id !== targetProposal.creator) {
            await addNotification(
              createNotification.proposalSupported(
                targetProposal.creator,
                targetProposal.projectId,
                proposalId,
                ctx.user.id,
              ),
              tx,
            );
          }

          return updatedVote;
        });
      } catch (error) {
        console.error('Error in switchVote:', {
          userId: ctx.user.id,
          proposalId: input.proposalId,
          key: input.key,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });

        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to switch vote',
          cause: error,
        });
      }
    }),

  getVotesByProposalId: publicProcedure
    .input(
      z.object({
        proposalId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const votes = await ctx.db.query.voteRecords.findMany({
        with: {
          creator: true,
        },
        where: eq(voteRecords.proposalId, input.proposalId),
      });

      return votes;
    }),

  getVotesByProjectId: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { projectId } = input;

      const votes = await ctx.db.query.voteRecords.findMany({
        with: {
          creator: true,
        },
        where: eq(voteRecords.projectId, projectId),
      });

      return votes;
    }),

  createItemProposalVote: protectedProcedure
    .input(
      z.object({
        itemProposalId: z.number(),
        key: z.string().min(1, 'Key cannot be empty'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { itemProposalId, key } = input;

        const [itemProposal, userProfile] = await Promise.all([
          ctx.db.query.itemProposals.findFirst({
            where: eq(itemProposals.id, itemProposalId),
            with: {
              creator: true,
            },
          }),
          ctx.db.query.profiles.findFirst({
            where: eq(profiles.userId, ctx.user.id),
          }),
        ]);

        if (!itemProposal) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Item proposal not found',
          });
        }

        const existingVote = await ctx.db.query.voteRecords.findFirst({
          where: and(
            eq(voteRecords.creator, ctx.user.id),
            eq(voteRecords.projectId, itemProposal.projectId),
            eq(voteRecords.key, key),
            isNull(voteRecords.proposalId),
          ),
        });

        if (existingVote) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'You have already voted for this key in this project',
          });
        }

        return await ctx.db.transaction(async (tx) => {
          const vote = await handleVoteRecord(tx, {
            userId: ctx.user.id,
            projectId: itemProposal.projectId,
            itemProposalId,
            key,
            weight: userProfile?.weight ?? 0,
          });

          if (ctx.user.id !== itemProposal.creator.userId) {
            await addNotification(
              createNotification.itemProposalSupported(
                itemProposal.creator.userId,
                itemProposal.projectId,
                itemProposalId,
                ctx.user.id,
              ),
              tx,
            );
          }

          const [votes, project, leadingProposal] = await Promise.all([
            tx.query.voteRecords.findMany({
              where: and(
                eq(voteRecords.itemProposalId, itemProposalId),
                eq(voteRecords.key, key),
              ),
            }),
            tx.query.projects.findFirst({
              where: eq(projects.id, itemProposal.projectId),
            }),
            tx.query.projectLogs.findFirst({
              where: and(
                eq(projectLogs.projectId, itemProposal.projectId),
                eq(projectLogs.key, key),
                eq(projectLogs.isNotLeading, false),
              ),
              orderBy: (projectLogs, { desc }) => [desc(projectLogs.createdAt)],
            }),
          ]);

          if (leadingProposal?.itemProposalId === itemProposalId) {
            await processItemProposalUpdate(tx, {
              votes,
              project,
              key,
            });
            return vote;
          }

          const needCheckQuorum = await checkNeedQuorum(tx, {
            projectId: itemProposal.projectId,
            key,
          });

          await processItemProposalVoteResult(tx, {
            votes,
            itemProposal,
            project,
            key,
            needCheckQuorum,
            userId: ctx.user.id,
          });

          return vote;
        });
      } catch (error) {
        console.error('Error in createItemProposalVote:', {
          userId: ctx.user.id,
          itemProposalId: input.itemProposalId,
          key: input.key,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });

        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create item proposal vote',
          cause: error,
        });
      }
    }),

  switchItemProposalVote: protectedProcedure
    .input(
      z.object({
        itemProposalId: z.number(),
        key: z.string().min(1, 'Key cannot be empty'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { itemProposalId, key } = input;

        const [targetItemProposal, userProfile] = await Promise.all([
          ctx.db.query.itemProposals.findFirst({
            where: eq(itemProposals.id, itemProposalId),
            with: {
              creator: true,
            },
          }),
          ctx.db.query.profiles.findFirst({
            where: eq(profiles.userId, ctx.user.id),
          }),
        ]);

        if (!targetItemProposal) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Target item proposal not found',
          });
        }

        const projectId = targetItemProposal.projectId;

        const voteToSwitch = await ctx.db.query.voteRecords.findFirst({
          where: and(
            eq(voteRecords.creator, ctx.user.id),
            eq(voteRecords.key, key),
            eq(voteRecords.projectId, projectId),
            isNull(voteRecords.proposalId),
          ),
        });

        if (!voteToSwitch) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No conflicting vote found to switch',
          });
        }

        if (voteToSwitch.itemProposalId === itemProposalId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
              'You have already voted for this key in the target item proposal',
          });
        }

        const originalItemProposalId = voteToSwitch.itemProposalId;

        const [project, leadingProposal] = await Promise.all([
          ctx.db.query.projects.findFirst({
            where: eq(projects.id, projectId),
          }),
          ctx.db.query.projectLogs.findFirst({
            where: and(
              eq(projectLogs.projectId, targetItemProposal.projectId),
              eq(projectLogs.key, key),
              eq(projectLogs.isNotLeading, false),
            ),
            orderBy: (projectLogs, { desc }) => [desc(projectLogs.createdAt)],
          }),
        ]);

        return await ctx.db.transaction(async (tx) => {
          const [updatedVote] = await tx
            .update(voteRecords)
            .set({
              itemProposalId,
              proposalId: null,
              weight: userProfile?.weight ?? 0,
            })
            .where(eq(voteRecords.id, voteToSwitch.id))
            .returning();

          if (ctx.user.id !== targetItemProposal.creator.userId) {
            await addNotification(
              createNotification.itemProposalSupported(
                targetItemProposal.creator.userId,
                projectId,
                itemProposalId,
                ctx.user.id,
              ),
              tx,
            );
          }

          const votes = await tx.query.voteRecords.findMany({
            where: and(
              eq(voteRecords.itemProposalId, itemProposalId),
              eq(voteRecords.key, key),
            ),
          });

          if (leadingProposal?.itemProposalId === itemProposalId) {
            await processItemProposalUpdate(tx, {
              votes,
              project,
              key,
            });
            return updatedVote;
          }

          const needCheckQuorum = await checkNeedQuorum(tx, {
            projectId,
            key,
          });

          await processItemProposalVoteResult(tx, {
            votes,
            itemProposal: targetItemProposal,
            project,
            key,
            needCheckQuorum,
            userId: ctx.user.id,
          });

          if (originalItemProposalId) {
            await handleOriginalProposalUpdate(tx, {
              originalItemProposalId,
              projectId,
              key,
              project,
            });
          }

          logUserActivity.vote.update(
            {
              userId: ctx.user.id,
              targetId: updatedVote.id,
              projectId,
              items: [{ field: key }],
              proposalCreatorId: targetItemProposal.creator.userId,
            },
            tx,
          );

          return updatedVote;
        });
      } catch (error) {
        console.error('Error in switchItemProposalVote:', {
          userId: ctx.user.id,
          itemProposalId: input.itemProposalId,
          key: input.key,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });

        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to switch item proposal vote',
          cause: error,
        });
      }
    }),
});
