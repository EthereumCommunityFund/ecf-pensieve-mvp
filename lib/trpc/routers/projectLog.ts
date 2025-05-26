import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { itemProposals, projectLogs } from '@/lib/db/schema';

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

      const allLogs = await ctx.db.query.projectLogs.findMany({
        where: eq(projectLogs.projectId, projectId),
        with: {
          proposal: {
            with: {
              creator: true,
            },
          },
          itemProposal: {
            with: {
              creator: true,
            },
          },
        },
        orderBy: (projectLogs, { desc }) => [desc(projectLogs.createdAt)],
      });

      const latestLogsByKey = new Map();

      for (const log of allLogs) {
        if (
          !latestLogsByKey.has(log.key) ||
          new Date(log.createdAt) >
            new Date(latestLogsByKey.get(log.key).createdAt)
        ) {
          latestLogsByKey.set(log.key, log);
        }
      }

      const latestLogs = Array.from(latestLogsByKey.values());

      const withoutItemProposal = latestLogs
        .filter((log) => log.proposalId && !log.itemProposalId)
        .map((v) => v);

      const withItemProposal = latestLogs
        .filter((log) => log.itemProposalId)
        .map((v) => v);

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

      const [leadingProposal, allItemProposals] = await Promise.all([
        ctx.db.query.projectLogs.findFirst({
          where: and(
            eq(projectLogs.projectId, projectId),
            eq(projectLogs.key, key),
          ),
          with: {
            proposal: {
              with: {
                voteRecords: true,
                creator: true,
              },
            },
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
          proposal: {
            with: {
              voteRecords: true,
              creator: true,
            },
          },
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
