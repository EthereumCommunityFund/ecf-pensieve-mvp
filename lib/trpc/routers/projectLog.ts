import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

import { itemProposals, profiles, projectLogs } from '@/lib/db/schema';

import { publicProcedure, router } from '../server';

export const projectLogRouter = router({
  getLeadingProposalsByProjectId: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { projectId } = input;

      const latestLogsSubquery = ctx.db
        .select({
          id: projectLogs.id,
          projectId: projectLogs.projectId,
          key: projectLogs.key,
          itemProposalId: projectLogs.itemProposalId,
          createdAt: projectLogs.createdAt,
          isNotLeading: projectLogs.isNotLeading,
          rn: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${projectLogs.key} ORDER BY ${projectLogs.createdAt} DESC)`.as(
            'rn',
          ),
        })
        .from(projectLogs)
        .where(eq(projectLogs.projectId, projectId))
        .as('latest_logs');

      const latestLogs = await ctx.db
        .select({
          id: latestLogsSubquery.id,
          projectId: latestLogsSubquery.projectId,
          key: latestLogsSubquery.key,
          itemProposalId: latestLogsSubquery.itemProposalId,
          createdAt: latestLogsSubquery.createdAt,
          isNotLeading: latestLogsSubquery.isNotLeading,
          itemProposal: {
            id: itemProposals.id,
            key: itemProposals.key,
            value: itemProposals.value,
            ref: itemProposals.ref,
            creator: itemProposals.creator,
            reason: itemProposals.reason,
            createdAt: itemProposals.createdAt,
          },
          creator: {
            userId: profiles.userId,
            name: profiles.name,
            avatarUrl: profiles.avatarUrl,
            address: profiles.address,
          },
        })
        .from(latestLogsSubquery)
        .leftJoin(
          itemProposals,
          eq(latestLogsSubquery.itemProposalId, itemProposals.id),
        )
        .leftJoin(profiles, eq(itemProposals.creator, profiles.userId))
        .where(eq(latestLogsSubquery.rn, 1));

      return latestLogs.map((row) => ({
        id: row.id,
        projectId: row.projectId,
        key: row.key,
        itemProposalId: row.itemProposalId,
        isNotLeading: row.isNotLeading,
        createdAt: row.createdAt,
        itemProposal: row.itemProposal?.id
          ? {
              ...row.itemProposal,
              creator: row.creator?.userId ? row.creator : null,
            }
          : null,
      }));
    }),

  getProposalsByProjectIdAndKey: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
        key: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { projectId, key } = input;

      const [leadingProposal, allItemProposals] = await Promise.all([
        ctx.db.query.projectLogs.findFirst({
          where: and(
            eq(projectLogs.projectId, projectId),
            eq(projectLogs.key, key),
          ),
          with: {
            itemProposal: {
              with: {
                voteRecords: true,
                creator: true,
              },
            },
          },
          orderBy: (projectLogs, { desc }) => [desc(projectLogs.createdAt)],
        }),

        ctx.db.query.itemProposals.findMany({
          where: and(
            eq(itemProposals.projectId, projectId),
            eq(itemProposals.key, key),
          ),
          with: {
            voteRecords: true,
            creator: true,
          },
        }),
      ]);

      return {
        leadingProposal,
        allItemProposals,
      };
    }),

  getLeadingProposalHistoryByProjectIdAndKey: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
        key: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { projectId, key } = input;

      const leadingProposal = await ctx.db.query.projectLogs.findMany({
        where: and(
          eq(projectLogs.projectId, projectId),
          eq(projectLogs.key, key),
        ),
        with: {
          itemProposal: {
            with: {
              voteRecords: true,
              creator: true,
            },
          },
        },
        orderBy: (projectLogs, { desc }) => [desc(projectLogs.createdAt)],
      });

      return leadingProposal;
    }),
});
