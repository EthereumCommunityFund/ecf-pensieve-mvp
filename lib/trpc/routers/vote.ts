import { TRPCError } from '@trpc/server';
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

import { QUORUM_AMOUNT, WEIGHT } from '@/lib/constants';
import {
  itemProposals,
  profiles,
  projects,
  proposals,
  voteRecords,
} from '@/lib/db/schema';
import { projectLogs } from '@/lib/db/schema/projectLogs';
import { POC_ITEMS } from '@/lib/pocItems';
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

      const [proposal, userProfile] = await Promise.all([
        ctx.db.query.proposals.findFirst({
          where: eq(proposals.id, proposalId),
        }),
        ctx.db.query.profiles.findFirst({
          where: eq(profiles.userId, ctx.user.id),
        }),
      ]);

      if (!proposal) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Proposal not found',
        });
      }

      const projectId = proposal.projectId;

      const project = await ctx.db.query.projects.findFirst({
        where: eq(projects.id, projectId),
      });

      if (project?.isPublished) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot vote on proposals for published projects',
        });
      }

      const otherVote = await ctx.db.query.voteRecords.findFirst({
        where: and(
          eq(voteRecords.creator, ctx.user.id),
          eq(voteRecords.key, key),
          eq(voteRecords.projectId, projectId),
        ),
      });

      if (otherVote) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'You have already voted for the same key in another proposal of this project',
        });
      }

      const [vote] = await ctx.db
        .insert(voteRecords)
        .values({
          key,
          proposalId,
          creator: ctx.user.id,
          weight: userProfile?.weight ?? 0,
          projectId,
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

      const [targetProposal, userProfile] = await Promise.all([
        ctx.db.query.proposals.findFirst({
          where: eq(proposals.id, proposalId),
        }),
        ctx.db.query.profiles.findFirst({
          where: eq(profiles.userId, ctx.user.id),
        }),
      ]);

      if (!targetProposal) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Target proposal not found',
        });
      }

      const project = await ctx.db.query.projects.findFirst({
        where: eq(projects.id, targetProposal.projectId),
      });

      if (project?.isPublished) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot switch votes on proposals for published projects',
        });
      }

      const voteToSwitch = await ctx.db.query.voteRecords.findFirst({
        where: and(
          eq(voteRecords.creator, ctx.user.id),
          eq(voteRecords.key, key),
          eq(voteRecords.projectId, targetProposal.projectId),
        ),
      });

      if (!voteToSwitch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No conflicting vote found to switch',
        });
      }

      if (voteToSwitch.creator === ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot switch vote from your own proposal',
        });
      }

      if (voteToSwitch.proposalId === proposalId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have already voted for this key in the target proposal',
        });
      }

      const [updatedVote] = await ctx.db
        .update(voteRecords)
        .set({
          proposalId,
          weight: userProfile?.weight ?? 0,
        })
        .where(eq(voteRecords.id, voteToSwitch.id))
        .returning();

      logUserActivity.vote.update({
        userId: ctx.user.id,
        targetId: updatedVote.id,
        projectId: targetProposal.projectId,
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

      const voteWithProposal = await ctx.db.query.voteRecords.findFirst({
        where: condition,
        with: {
          proposal: true,
        },
      });

      if (!voteWithProposal || !voteWithProposal.proposal) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vote record not found',
        });
      }

      if (voteWithProposal.proposal.creator === ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot cancel vote on your own proposal',
        });
      }

      const projectId = voteWithProposal.proposal.projectId;

      const project = await ctx.db.query.projects.findFirst({
        where: eq(projects.id, projectId),
      });

      if (project?.isPublished) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot cancel votes on proposals for published projects',
        });
      }

      const [deletedVote] = await ctx.db
        .delete(voteRecords)
        .where(condition)
        .returning();

      logUserActivity.vote.delete({
        userId: ctx.user.id,
        targetId: deletedVote.id,
        projectId,
        items: [{ field: voteWithProposal.key }],
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

  createItemProposalVote: protectedProcedure
    .input(
      z.object({
        itemProposalId: z.number(),
        key: z.string().min(1, 'Key cannot be empty'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { itemProposalId, key } = input;

      const [itemProposal, userProfile] = await Promise.all([
        ctx.db.query.itemProposals.findFirst({
          where: eq(itemProposals.id, itemProposalId),
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

      const existingVote = await ctx.db.query.voteRecords.findMany({
        where: and(
          eq(voteRecords.creator, ctx.user.id),
          eq(voteRecords.projectId, itemProposal.projectId),
          eq(voteRecords.key, key),
        ),
      });

      if (existingVote.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have already voted for this key in this project',
        });
      }

      const [vote] = await ctx.db
        .insert(voteRecords)
        .values({
          key,
          itemProposalId,
          creator: ctx.user.id,
          weight: userProfile?.weight ?? 0,
          projectId: itemProposal.projectId,
        })
        .returning();

      const [votes, project] = await Promise.all([
        ctx.db.query.voteRecords.findMany({
          where: and(
            eq(voteRecords.itemProposalId, itemProposalId),
            eq(voteRecords.key, key),
          ),
        }),
        ctx.db.query.projects.findFirst({
          where: eq(projects.id, itemProposal.projectId),
        }),
      ]);

      const voteSum = votes.reduce((acc, vote) => {
        acc += vote.weight ?? 0;
        return acc;
      }, 0);

      const itemsTopWeight = project?.itemsTopWeight as
        | Record<string, number>
        | undefined;
      const keyWeight = itemsTopWeight?.[key] ?? 0;

      if (voteSum > keyWeight) {
        await Promise.all([
          ctx.db.insert(projectLogs).values({
            projectId: itemProposal.projectId,
            itemProposalId,
            key,
          }),
          ctx.db.update(projects).set({
            itemsTopWeight: {
              ...(project?.itemsTopWeight ?? {}),
              [key]: voteSum,
            },
          }),
        ]);
      }

      logUserActivity.vote.create({
        userId: ctx.user.id,
        targetId: vote.id,
        projectId: itemProposal.projectId,
        items: [{ field: key }],
        proposalCreatorId: itemProposal.creator,
      });

      return vote;
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

      const [targetItemProposal, userSpecificVotesForKey, userProfile] =
        await Promise.all([
          ctx.db.query.itemProposals.findFirst({
            where: eq(itemProposals.id, itemProposalId),
          }),
          ctx.db.query.voteRecords.findMany({
            where: and(
              eq(voteRecords.creator, ctx.user.id),
              eq(voteRecords.key, key),
            ),
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

      const leadingProposal = await ctx.db.query.projectLogs.findFirst({
        where: and(
          eq(projectLogs.projectId, projectId),
          eq(projectLogs.key, key),
        ),
        orderBy: (projectLogs, { desc }) => [desc(projectLogs.createdAt)],
      });

      if (
        leadingProposal &&
        leadingProposal.itemProposalId === itemProposalId
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot vote on the leading proposal',
        });
      }

      const projectItemProposals = await ctx.db.query.itemProposals.findMany({
        where: eq(itemProposals.projectId, projectId),
      });

      const projectItemProposalIds = projectItemProposals.map((p) => p.id);

      const conflictingVotes = userSpecificVotesForKey.filter(
        (vote) =>
          vote.itemProposalId !== null &&
          projectItemProposalIds.includes(vote.itemProposalId) &&
          vote.itemProposalId !== itemProposalId,
      );

      if (conflictingVotes.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No conflicting vote found to switch',
        });
      }

      const voteToSwitch = conflictingVotes[0];

      const existingVoteForTargetItemProposal = userSpecificVotesForKey.find(
        (vote) => vote.itemProposalId === itemProposalId,
      );

      if (existingVoteForTargetItemProposal) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'You have already voted for this key in the target item proposal',
        });
      }

      if (voteToSwitch.itemProposalId) {
        const originalLeadingCheck = await ctx.db.query.projectLogs.findFirst({
          where: and(
            eq(projectLogs.projectId, projectId),
            eq(projectLogs.key, key),
          ),
          orderBy: (projectLogs, { desc }) => [desc(projectLogs.createdAt)],
        });

        if (
          originalLeadingCheck &&
          originalLeadingCheck.itemProposalId === voteToSwitch.itemProposalId
        ) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot switch vote from the leading proposal',
          });
        }
      }

      const [updatedVote] = await ctx.db
        .update(voteRecords)
        .set({
          itemProposalId,
          weight: userProfile?.weight ?? 0,
        })
        .where(eq(voteRecords.id, voteToSwitch.id))
        .returning();

      const votes = await ctx.db.query.voteRecords.findMany({
        where: and(
          eq(voteRecords.itemProposalId, itemProposalId),
          eq(voteRecords.key, key),
        ),
      });

      if (votes.length >= QUORUM_AMOUNT) {
        const voteSum = votes.reduce((acc, vote) => {
          acc += vote.weight ?? 0;
          return acc;
        }, 0);

        if (
          voteSum >=
          POC_ITEMS[key as keyof typeof POC_ITEMS].accountability_metric *
            WEIGHT
        ) {
          await ctx.db.insert(projectLogs).values({
            projectId: targetItemProposal.projectId,
            itemProposalId,
            key,
          });
        }
      }

      logUserActivity.vote.update({
        userId: ctx.user.id,
        targetId: updatedVote.id,
        projectId,
        items: [{ field: key }],
        proposalCreatorId: targetItemProposal.creator,
      });

      return updatedVote;
    }),
});
