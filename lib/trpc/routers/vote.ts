import { TRPCError } from '@trpc/server';
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

import { proposals, voteRecords } from '@/lib/db/schema';
import { logUserActivity } from '@/lib/services/activeLogsService';

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

      const proposal = await ctx.db.query.proposals.findFirst({
        where: eq(proposals.id, proposalId),
      });

      if (!proposal) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Proposal not found',
        });
      }

      const projectId = proposal.projectId;

      const projectProposals = await ctx.db.query.proposals.findMany({
        where: eq(proposals.projectId, projectId),
      });

      const projectProposalIds = projectProposals.map((p) => p.id);

      const existingVotes = await ctx.db.query.voteRecords.findMany({
        where: and(
          eq(voteRecords.creator, ctx.user.id),
          eq(voteRecords.key, key),
        ),
      });

      const conflictingVotes = existingVotes.filter(
        (vote) =>
          projectProposalIds.includes(vote.proposalId) &&
          vote.proposalId !== proposalId,
      );

      if (conflictingVotes.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'You have already voted for the same key in another proposal of this project',
        });
      }

      const existingVote = await ctx.db.query.voteRecords.findFirst({
        where: and(
          eq(voteRecords.creator, ctx.user.id),
          eq(voteRecords.proposalId, proposalId),
          eq(voteRecords.key, key),
        ),
      });

      if (existingVote) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have already voted for this key in this proposal',
        });
      }

      const [vote] = await ctx.db
        .insert(voteRecords)
        .values({
          key,
          proposalId,
          creator: ctx.user.id,
        })
        .returning();

      logUserActivity.vote.create({
        userId: ctx.user.id,
        targetId: vote.id,
        projectId,
        items: [{ field: key }],
        proposalCreatorId: proposal.creator,
      });

      return vote;
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

      const targetProposal = await ctx.db.query.proposals.findFirst({
        where: eq(proposals.id, proposalId),
      });

      if (!targetProposal) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Target proposal not found',
        });
      }

      const projectId = targetProposal.projectId;

      const projectProposals = await ctx.db.query.proposals.findMany({
        where: eq(proposals.projectId, projectId),
      });

      const projectProposalIds = projectProposals.map((p) => p.id);

      const existingVotes = await ctx.db.query.voteRecords.findMany({
        where: and(
          eq(voteRecords.creator, ctx.user.id),
          eq(voteRecords.key, key),
        ),
      });

      const conflictingVotes = existingVotes.filter(
        (vote) =>
          projectProposalIds.includes(vote.proposalId) &&
          vote.proposalId !== proposalId,
      );

      if (conflictingVotes.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No conflicting vote found to switch',
        });
      }

      const voteToSwitch = conflictingVotes[0];

      const targetProposalVote = await ctx.db.query.voteRecords.findFirst({
        where: and(
          eq(voteRecords.creator, ctx.user.id),
          eq(voteRecords.proposalId, proposalId),
          eq(voteRecords.key, key),
        ),
      });

      if (targetProposalVote) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have already voted for this key in the target proposal',
        });
      }

      const [updatedVote] = await ctx.db
        .update(voteRecords)
        .set({
          proposalId,
        })
        .where(eq(voteRecords.id, voteToSwitch.id))
        .returning();

      logUserActivity.vote.update({
        userId: ctx.user.id,
        targetId: updatedVote.id,
        projectId,
        items: [{ field: key }],
        proposalCreatorId: targetProposal.creator,
      });

      return updatedVote;
    }),

  cancelVote: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const condition = and(
        eq(voteRecords.id, id),
        eq(voteRecords.creator, ctx.user.id),
      );

      const [existingVote, voteWithProposal] = await Promise.all([
        ctx.db.query.voteRecords.findFirst({
          where: condition,
        }),
        ctx.db.query.voteRecords.findFirst({
          where: condition,
          with: {
            proposal: true,
          },
        }),
      ]);

      if (!existingVote || !voteWithProposal || !voteWithProposal.proposal) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vote record not found',
        });
      }

      const projectId = voteWithProposal.proposal.projectId;

      const [deletedVote] = await ctx.db
        .delete(voteRecords)
        .where(condition)
        .returning();

      logUserActivity.vote.delete({
        userId: ctx.user.id,
        targetId: deletedVote.id,
        projectId,
        items: [{ field: existingVote.key }],
        proposalCreatorId: voteWithProposal.proposal.creator,
      });

      return deletedVote;
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

      const projectProposals = await ctx.db.query.proposals.findMany({
        where: eq(proposals.projectId, projectId),
      });

      if (!projectProposals || projectProposals.length === 0) {
        return [];
      }

      const proposalIds = projectProposals.map((p) => p.id);

      const votes = await ctx.db.query.voteRecords.findMany({
        with: {
          creator: true,
        },
        where: inArray(voteRecords.proposalId, proposalIds),
      });

      return votes;
    }),
});
