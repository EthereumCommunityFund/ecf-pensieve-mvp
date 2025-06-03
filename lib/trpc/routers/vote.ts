import { TRPCError } from '@trpc/server';
import { and, eq, ne } from 'drizzle-orm';
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
      const { proposalId, key } = input;

      return await ctx.db.transaction(async (tx) => {
        const [proposalWithProject, userProfile, existingVote] =
          await Promise.all([
            tx.query.proposals.findFirst({
              where: eq(proposals.id, proposalId),
              with: {
                project: true,
              },
            }),
            tx.query.profiles.findFirst({
              where: eq(profiles.userId, ctx.user.id),
            }),
            tx.query.voteRecords.findFirst({
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

        const otherVote = await tx.query.voteRecords.findFirst({
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

        return vote;
      });
    }),

  switchVote: protectedProcedure
    .input(
      z.object({
        proposalId: z.number(),
        key: z.string().min(1, 'Key cannot be empty'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { proposalId, key } = input;

      return await ctx.db.transaction(async (tx) => {
        const targetProposal = await tx.query.proposals.findFirst({
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
          tx.query.profiles.findFirst({
            where: eq(profiles.userId, ctx.user.id),
          }),
          tx.query.voteRecords.findFirst({
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

        return updatedVote;
      });
    }),

  cancelVote: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      return await ctx.db.transaction(async (tx) => {
        const condition = and(
          eq(voteRecords.id, id),
          eq(voteRecords.creator, ctx.user.id),
        );

        const voteWithDetails = await tx.query.voteRecords.findFirst({
          where: condition,
          with: {
            proposal: {
              with: {
                project: true,
              },
            },
          },
        });

        if (!voteWithDetails || !voteWithDetails.proposal) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Vote record not found',
          });
        }

        if (!voteWithDetails.proposal.project) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Associated project not found',
          });
        }

        if (voteWithDetails.proposal.creator === ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot cancel vote on your own proposal',
          });
        }

        if (voteWithDetails.proposal.project.isPublished) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot cancel votes on proposals for published projects',
          });
        }

        const [deletedVote] = await tx
          .delete(voteRecords)
          .where(condition)
          .returning();

        logUserActivity.vote.delete(
          {
            userId: ctx.user.id,
            targetId: deletedVote.id,
            projectId: voteWithDetails.proposal!.projectId,
            items: [{ field: voteWithDetails.key }],
            proposalCreatorId: voteWithDetails.proposal!.creator,
          },
          tx,
        );

        return deletedVote;
      });
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
      const { itemProposalId, key } = input;

      return await ctx.db.transaction(async (tx) => {
        const [itemProposal, userProfile] = await Promise.all([
          tx.query.itemProposals.findFirst({
            where: eq(itemProposals.id, itemProposalId),
            with: {
              creator: true,
            },
          }),
          tx.query.profiles.findFirst({
            where: eq(profiles.userId, ctx.user.id),
          }),
        ]);

        if (!itemProposal) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Item proposal not found',
          });
        }

        const existingVote = await tx.query.voteRecords.findFirst({
          where: and(
            eq(voteRecords.creator, ctx.user.id),
            eq(voteRecords.projectId, itemProposal.projectId),
            eq(voteRecords.key, key),
          ),
        });

        if (existingVote) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'You have already voted for this key in this project',
          });
        }

        const vote = await handleVoteRecord(tx, {
          userId: ctx.user.id,
          projectId: itemProposal.projectId,
          itemProposalId,
          key,
          weight: userProfile?.weight ?? 0,
        });

        const [votes, project, projectLog] = await Promise.all([
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

        if (projectLog?.itemProposalId === itemProposalId) {
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
    }),

  switchItemProposalVote: protectedProcedure
    .input(
      z.object({
        itemProposalId: z.number(),
        key: z.string().min(1, 'Key cannot be empty'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { itemProposalId, key } = input;

      return await ctx.db.transaction(async (tx) => {
        const [targetItemProposal, userProfile] = await Promise.all([
          tx.query.itemProposals.findFirst({
            where: eq(itemProposals.id, itemProposalId),
            with: {
              creator: true,
            },
          }),
          tx.query.profiles.findFirst({
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

        const voteToSwitch = await tx.query.voteRecords.findFirst({
          where: and(
            eq(voteRecords.creator, ctx.user.id),
            eq(voteRecords.key, key),
            eq(voteRecords.projectId, projectId),
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

        const [updatedVote] = await tx
          .update(voteRecords)
          .set({
            itemProposalId,
            proposalId: null,
            weight: userProfile?.weight ?? 0,
          })
          .where(eq(voteRecords.id, voteToSwitch.id))
          .returning();

        const [votes, project, projectLog] = await Promise.all([
          tx.query.voteRecords.findMany({
            where: and(
              eq(voteRecords.itemProposalId, itemProposalId),
              eq(voteRecords.key, key),
            ),
          }),
          tx.query.projects.findFirst({
            where: eq(projects.id, projectId),
          }),
          tx.query.projectLogs.findFirst({
            where: and(
              eq(projectLogs.projectId, targetItemProposal.projectId),
              eq(projectLogs.key, key),
              eq(projectLogs.isNotLeading, false),
            ),
            orderBy: (projectLogs, { desc }) => [desc(projectLogs.createdAt)],
          }),
        ]);

        if (projectLog?.itemProposalId === itemProposalId) {
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
    }),
});
