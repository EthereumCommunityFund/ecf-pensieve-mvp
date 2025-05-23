import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

import { itemProposals, projectLogs, proposals } from '@/lib/db/schema';

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

      const rankedLogsSubquery = ctx.db
        .select({
          id: projectLogs.id,
          createdAt: projectLogs.createdAt,
          projectId: projectLogs.projectId,
          proposalId: projectLogs.proposalId,
          itemProposalId: projectLogs.itemProposalId,
          key: projectLogs.key,
          rowNumber:
            sql<number>`ROW_NUMBER() OVER (PARTITION BY ${projectLogs.key} ORDER BY ${projectLogs.createdAt} DESC)`.as(
              'rn',
            ),
        })
        .from(projectLogs)
        .where(eq(projectLogs.projectId, projectId))
        .as('ranked_logs');

      const withoutItemProposal = await ctx.db
        .select({
          id: rankedLogsSubquery.id,
          createdAt: rankedLogsSubquery.createdAt,
          key: rankedLogsSubquery.key,
          projectId: rankedLogsSubquery.projectId,
          proposalId: rankedLogsSubquery.proposalId,
          proposal: {
            id: proposals.id,
            items: proposals.items,
            refs: proposals.refs,
            creator: proposals.creator,
            createdAt: proposals.createdAt,
          },
        })
        .from(rankedLogsSubquery)
        .leftJoin(proposals, eq(proposals.id, rankedLogsSubquery.proposalId))
        .where(
          sql`${rankedLogsSubquery.rowNumber} = 1 AND ${rankedLogsSubquery.itemProposalId} IS NULL`,
        );

      const withItemProposal = await ctx.db
        .select({
          id: rankedLogsSubquery.id,
          createdAt: rankedLogsSubquery.createdAt,
          key: rankedLogsSubquery.key,
          projectId: rankedLogsSubquery.projectId,
          itemProposalId: rankedLogsSubquery.itemProposalId,
          itemProposal: {
            id: itemProposals.id,
            key: itemProposals.key,
            value: itemProposals.value,
            ref: itemProposals.ref,
            creator: itemProposals.creator,
            createdAt: itemProposals.createdAt,
          },
        })
        .from(rankedLogsSubquery)
        .leftJoin(
          itemProposals,
          eq(itemProposals.id, rankedLogsSubquery.itemProposalId),
        )
        .where(
          sql`${rankedLogsSubquery.rowNumber} = 1 AND ${rankedLogsSubquery.itemProposalId} IS NOT NULL`,
        );

      return {
        withoutItemProposal,
        withItemProposal,
      };
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

      const proposals = await ctx.db.query.projectLogs.findMany({
        where: and(
          eq(projectLogs.projectId, projectId),
          eq(projectLogs.key, key),
        ),
        with: {
          itemProposals: {
            with: {
              creator: true,
            },
          },
        },
      });

      return proposals;
    }),
});
