import { and, desc, eq, inArray, or } from 'drizzle-orm';
import { z } from 'zod';

import { projectRelations } from '@/lib/db/schema';

import { publicProcedure, router } from '../server';

export const projectRelationRouter = router({
  getFundingRelations: publicProcedure
    .input(
      z.object({
        projectId: z.number().int().positive(),
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
        orderBy: desc(projectRelations.createdAt),
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

  getEcosystemRelations: publicProcedure
    .input(
      z.object({
        projectId: z.number().int().positive(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const relations = await ctx.db.query.projectRelations.findMany({
        where: and(
          or(
            eq(projectRelations.sourceProjectId, input.projectId),
            eq(projectRelations.targetProjectId, input.projectId),
          ),
          inArray(projectRelations.relationType, [
            'affiliated',
            'contributing_team',
            'stack_integration',
          ]),
          eq(projectRelations.isActive, true),
        ),
        orderBy: desc(projectRelations.createdAt),
      });

      return {
        affiliatedProjects: {
          asSource: relations.filter(
            (r) =>
              r.sourceProjectId === input.projectId &&
              r.relationType === 'affiliated',
          ),
          asTarget: relations.filter(
            (r) =>
              r.targetProjectId === input.projectId &&
              r.relationType === 'affiliated',
          ),
        },
        contributingTeams: {
          asSource: relations.filter(
            (r) =>
              r.sourceProjectId === input.projectId &&
              r.relationType === 'contributing_team',
          ),
          asTarget: relations.filter(
            (r) =>
              r.targetProjectId === input.projectId &&
              r.relationType === 'contributing_team',
          ),
        },
        stackIntegrations: {
          asSource: relations.filter(
            (r) =>
              r.sourceProjectId === input.projectId &&
              r.relationType === 'stack_integration',
          ),
          asTarget: relations.filter(
            (r) =>
              r.targetProjectId === input.projectId &&
              r.relationType === 'stack_integration',
          ),
        },
      };
    }),
});
