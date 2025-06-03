import { performance } from 'perf_hooks';

import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { profiles, projects, proposals, voteRecords } from '@/lib/db/schema';
import { logUserActivity } from '@/lib/services/activeLogsService';
import { dbLog, perfLog } from '@/utils/devLog';

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
      const totalStartTime = performance.now();

      return await ctx.db.transaction(async (tx) => {
        // 并行查询项目和用户信息
        const queryStartTime = performance.now();
        const [project, userProfile] = await Promise.all([
          tx.query.projects.findFirst({
            where: eq(projects.id, input.projectId),
          }),
          tx.query.profiles.findFirst({
            where: eq(profiles.userId, ctx.user.id),
          }),
        ]);
        dbLog(
          'SELECT',
          'projects+profiles',
          performance.now() - queryStartTime,
          2,
        );

        if (!project) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Project not found',
          });
        }

        // 插入提案
        const insertStartTime = performance.now();
        const [proposal] = await tx
          .insert(proposals)
          .values({
            projectId: input.projectId,
            items: input.items,
            refs: input.refs,
            creator: ctx.user.id,
          })
          .returning();
        dbLog('INSERT', 'proposals', performance.now() - insertStartTime, 1);

        if (!proposal) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Proposal not found',
          });
        }

        // 处理投票记录
        const voteStartTime = performance.now();
        const votePromises = input.items.map(async (item) => {
          const voteQueryStartTime = performance.now();
          const otherVote = await tx.query.voteRecords.findFirst({
            where: and(
              eq(voteRecords.creator, ctx.user.id),
              eq(voteRecords.key, item.key),
              eq(voteRecords.projectId, input.projectId),
            ),
          });
          dbLog(
            'SELECT',
            'voteRecords',
            performance.now() - voteQueryStartTime,
            1,
          );

          let vote;
          if (otherVote) {
            const updateStartTime = performance.now();
            [vote] = await tx
              .update(voteRecords)
              .set({
                proposalId: proposal.id,
                weight: userProfile?.weight ?? 0,
              })
              .where(eq(voteRecords.id, otherVote.id))
              .returning();
            dbLog(
              'UPDATE',
              'voteRecords',
              performance.now() - updateStartTime,
              1,
            );

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
            const insertVoteStartTime = performance.now();
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
            dbLog(
              'INSERT',
              'voteRecords',
              performance.now() - insertVoteStartTime,
              1,
            );

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
        perfLog('Process vote records', performance.now() - voteStartTime, {
          itemCount: input.items.length,
        });

        // 记录用户活动
        const activityStartTime = performance.now();
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
        perfLog('Log user activity', performance.now() - activityStartTime);

        perfLog(
          'TOTAL createProposal execution',
          performance.now() - totalStartTime,
          { projectId: input.projectId, itemCount: input.items.length },
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
