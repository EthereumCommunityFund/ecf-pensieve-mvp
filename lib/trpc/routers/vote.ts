import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { proposals, voteRecords } from '@/lib/db/schema';
import { logUserActivity } from '@/lib/services/activeLogsService';

import { protectedProcedure, router } from '../server';

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

      const proposal = await ctx.db
        .select()
        .from(proposals)
        .where(eq(proposals.id, proposalId))
        .limit(1);

      if (!proposal || proposal.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Proposal not found',
        });
      }

      const projectProposals = await ctx.db
        .select()
        .from(proposals)
        .where(eq(proposals.projectId, proposal[0].projectId));

      const projectProposalIds = projectProposals.map((p) => p.id);

      const existingVotes = await ctx.db
        .select()
        .from(voteRecords)
        .where(
          and(eq(voteRecords.creator, ctx.user.id), eq(voteRecords.key, key)),
        );

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

      const existingVote = await ctx.db
        .select()
        .from(voteRecords)
        .where(
          and(
            eq(voteRecords.creator, ctx.user.id),
            eq(voteRecords.proposalId, proposalId),
            eq(voteRecords.key, key),
          ),
        )
        .limit(1);

      if (existingVote && existingVote.length > 0) {
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

      logUserActivity.vote.create(ctx.user.id, vote.id);

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

      const targetProposal = await ctx.db
        .select()
        .from(proposals)
        .where(eq(proposals.id, proposalId))
        .limit(1);

      if (!targetProposal || targetProposal.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Target proposal not found',
        });
      }

      const projectProposals = await ctx.db
        .select()
        .from(proposals)
        .where(eq(proposals.projectId, targetProposal[0].projectId));

      const projectProposalIds = projectProposals.map((p) => p.id);

      const existingVotes = await ctx.db
        .select()
        .from(voteRecords)
        .where(
          and(eq(voteRecords.creator, ctx.user.id), eq(voteRecords.key, key)),
        );

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

      const targetProposalVote = await ctx.db
        .select()
        .from(voteRecords)
        .where(
          and(
            eq(voteRecords.creator, ctx.user.id),
            eq(voteRecords.proposalId, proposalId),
            eq(voteRecords.key, key),
          ),
        )
        .limit(1);

      if (targetProposalVote && targetProposalVote.length > 0) {
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

      logUserActivity.vote.update(ctx.user.id, updatedVote.id);

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

      const existingVote = await ctx.db
        .select()
        .from(voteRecords)
        .where(condition)
        .limit(1);

      if (!existingVote || existingVote.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vote record not found',
        });
      }

      const [deletedVote] = await ctx.db
        .delete(voteRecords)
        .where(condition)
        .returning();

      logUserActivity.vote.delete(ctx.user.id, deletedVote.id);

      return deletedVote;
    }),
});
