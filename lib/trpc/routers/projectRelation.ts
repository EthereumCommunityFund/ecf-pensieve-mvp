import { and, eq, or } from 'drizzle-orm';
import { z } from 'zod';

import { projectRelations } from '@/lib/db/schema';

import { publicProcedure, router } from '../server';

export const projectRelationRouter = router({
  getFundingRelations: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const relations = await ctx.db.query.projectRelations.findMany({
        where: and(
          or(
            eq(projectRelations.sourceProjectId, input.projectId),
            eq(projectRelations.targetProjectId, input.projectId),
          ),
          eq(projectRelations.isActive, true),
        ),
      });

      return {
        fundedBy: {
          organizations: relations.filter(
            (r) =>
              r.targetProjectId === input.projectId &&
              r.relationType === 'organization',
          ),
          donators: relations.filter(
            (r) =>
              r.targetProjectId === input.projectId &&
              r.relationType === 'donator',
          ),
        },
        funding: {
          asOrganization: relations.filter(
            (r) =>
              r.sourceProjectId === input.projectId &&
              r.relationType === 'organization',
          ),
          asDonator: relations.filter(
            (r) =>
              r.sourceProjectId === input.projectId &&
              r.relationType === 'donator',
          ),
        },
      };
    }),
});
