import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { profiles, projects, proposals, voteRecords } from '@/lib/db/schema';
import { logUserActivity } from '@/lib/services/activeLogsService';

import { protectedProcedure, publicProcedure, router } from '../server';

export const proposalRouter = router({
  createProposal: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        items: z.array(
          z.object({
            key: z.string().min(1, 'Key cannot be empty'),
            value: z.any(),
          }),
        ),
        refs: z
          .array(
            z.object({
              key: z.string().min(1, 'Key cannot be empty'),
              value: z.string().min(1, 'Value cannot be empty'),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const [project, userProfile] = await Promise.all([
          tx.query.projects.findFirst({
            where: eq(projects.id, input.projectId),
          }),
          tx.query.profiles.findFirst({
            where: eq(profiles.userId, ctx.user.id),
          }),
        ]);

        if (!project) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Project not found',
          });
        }

        const [proposal] = await tx
          .insert(proposals)
          .values({
            projectId: input.projectId,
            items: input.items,
            refs: input.refs,
            creator: ctx.user.id,
          })
          .returning();

        if (!proposal) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Proposal not found',
          });
        }

        const votePromises = input.items.map(async (item) => {
          const otherVote = await tx.query.voteRecords.findFirst({
            where: and(
              eq(voteRecords.creator, ctx.user.id),
              eq(voteRecords.key, item.key),
              eq(voteRecords.projectId, input.projectId),
            ),
          });

          let vote;
          if (otherVote) {
            [vote] = await tx
              .update(voteRecords)
              .set({
                proposalId: proposal.id,
                weight: userProfile?.weight ?? 0,
              })
              .where(eq(voteRecords.id, otherVote.id))
              .returning();

            logUserActivity.vote.update(
              {
                userId: ctx.user.id,
                targetId: vote.id,
                projectId: input.projectId,
                items: [{ field: item.key }],
                proposalCreatorId: ctx.user.id,
              },
              tx,
            );
          } else {
            [vote] = await tx
              .insert(voteRecords)
              .values({
                key: item.key,
                proposalId: proposal.id,
                creator: ctx.user.id,
                weight: userProfile?.weight ?? 0,
                projectId: input.projectId,
              })
              .returning();

            logUserActivity.vote.create(
              {
                userId: ctx.user.id,
                targetId: vote.id,
                projectId: input.projectId,
                items: [{ field: item.key }],
                proposalCreatorId: ctx.user.id,
              },
              tx,
            );
          }

          return vote;
        });

        await Promise.all(votePromises);

        logUserActivity.proposal.create(
          {
            userId: ctx.user.id,
            targetId: proposal.id,
            projectId: proposal.projectId,
            items: input.items.map((item) => ({
              field: item.key,
              newValue: item.value,
            })),
          },
          tx,
        );

        return proposal;
      });
    }),

  getProposalsByProjectId: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const proposalsData = await ctx.db.query.proposals.findMany({
        with: {
          creator: true,
        },
        where: eq(proposals.projectId, input.projectId),
      });

      return proposalsData;
    }),

  getProposalById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const proposal = await ctx.db.query.proposals.findFirst({
        with: {
          creator: true,
        },
        where: eq(proposals.id, input.id),
      });

      if (!proposal) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Proposal not found',
        });
      }

      return proposal;
    }),
});
