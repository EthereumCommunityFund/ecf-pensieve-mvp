import { TRPCError } from '@trpc/server';
import { and, eq, inArray } from 'drizzle-orm';
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
      try {
        const [project, userProfile] = await Promise.all([
          ctx.db.query.projects.findFirst({
            where: eq(projects.id, input.projectId),
          }),
          ctx.db.query.profiles.findFirst({
            where: eq(profiles.userId, ctx.user.id),
          }),
        ]);

        if (!project) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Project not found',
          });
        }

        return await ctx.db.transaction(async (tx) => {
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

          const userWeight = userProfile?.weight ?? 0;
          const itemKeys = input.items.map((item) => item.key);

          const existingVotes = await tx.query.voteRecords.findMany({
            where: and(
              eq(voteRecords.creator, ctx.user.id),
              eq(voteRecords.projectId, input.projectId),
              inArray(voteRecords.key, itemKeys),
            ),
          });

          const voteMap = new Map(
            existingVotes.map((vote) => [vote.key, vote]),
          );

          const updateOperations = [];
          const insertOperations = [];
          const logEntries = [];

          for (const item of input.items) {
            const existingVote = voteMap.get(item.key);

            if (existingVote) {
              updateOperations.push(
                tx
                  .update(voteRecords)
                  .set({
                    proposalId: proposal.id,
                    weight: userWeight,
                  })
                  .where(eq(voteRecords.id, existingVote.id))
                  .returning(),
              );

              logEntries.push({
                action: 'update' as const,
                targetId: existingVote.id,
                field: item.key,
              });
            } else {
              insertOperations.push(
                tx
                  .insert(voteRecords)
                  .values({
                    key: item.key,
                    proposalId: proposal.id,
                    creator: ctx.user.id,
                    weight: userWeight,
                    projectId: input.projectId,
                  })
                  .returning(),
              );

              logEntries.push({
                action: 'create' as const,
                field: item.key,
              });
            }
          }

          await logUserActivity.proposal.create(
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

          const [updateResults, insertResults] = await Promise.all([
            Promise.all(updateOperations),
            Promise.all(insertOperations),
          ]);

          const allVotes = [...updateResults.flat(), ...insertResults.flat()];

          const logPromises = logEntries.map((entry, index) => {
            const vote = allVotes[index];
            const logData = {
              userId: ctx.user.id,
              targetId: vote.id,
              projectId: input.projectId,
              items: [{ field: entry.field }],
              proposalCreatorId: ctx.user.id,
            };

            return entry.action === 'update'
              ? logUserActivity.vote.update(logData, tx)
              : logUserActivity.vote.create(logData, tx);
          });

          await Promise.all([...logPromises]);

          return proposal;
        });
      } catch (error) {
        console.error('Error in createProposal:', {
          userId: ctx.user.id,
          projectId: input.projectId,
          items: input.items,
          refs: input.refs,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create proposal',
          cause: error,
        });
      }
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
