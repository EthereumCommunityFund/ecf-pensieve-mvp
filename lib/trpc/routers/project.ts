import { TRPCError } from '@trpc/server';
import { and, desc, eq, gt, sql } from 'drizzle-orm';
import { z } from 'zod';

import { profiles, projects } from '@/lib/db/schema';
import { protectedProcedure, publicProcedure, router } from '@/lib/trpc/server';

export const projectRouter = router({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name cannot be empty'),
        tagline: z.string().min(1, 'Tagline cannot be empty'),
        categories: z
          .array(z.string())
          .min(1, 'At least one category is required'),
        mainDescription: z.string().min(1, 'Main description cannot be empty'),
        logoUrl: z.string().min(1, 'Logo URL cannot be empty'),
        websiteUrl: z.string().min(1, 'Website URL cannot be empty'),
        appUrl: z.string().optional(),
        dateFounded: z.date(),
        dateLaunch: z.date().optional(),
        devStatus: z.string().min(1, 'Development status cannot be empty'),
        fundingStatus: z.string().optional(),
        openSource: z.boolean(),
        codeRepo: z.string().optional(),
        tokenContract: z.string().optional(),
        orgStructure: z
          .string()
          .min(1, 'Organization structure cannot be empty'),
        publicGoods: z.boolean(),
        founders: z
          .array(
            z.object({
              name: z.string().min(1, 'Founder name cannot be empty'),
              title: z.string().min(1, 'Founder title cannot be empty'),
            }),
          )
          .min(1, 'At least one founder is required'),
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
      const [project] = await ctx.db
        .insert(projects)
        .values({
          ...input,
          creator: ctx.user.id,
        })
        .returning();

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'project not found',
        });
      }

      return project;
    }),

  getProjects: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          cursor: z.number().optional(),
          isPublished: z.boolean().optional().default(false),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const cursor = input?.cursor;
      const isPublished = input?.isPublished ?? false;

      const baseCondition = eq(projects.isPublished, isPublished);
      const whereCondition = cursor
        ? and(baseCondition, gt(projects.id, cursor))
        : baseCondition;

      const query = ctx.db
        .select({
          project: projects,
          creator: profiles,
        })
        .from(projects)
        .leftJoin(profiles, eq(projects.creator, profiles.userId))
        .where(whereCondition)
        .orderBy(desc(projects.id))
        .limit(limit);

      const results = await query;

      const items = results.map(({ project, creator }) => ({
        ...project,
        creator,
      }));

      const nextCursor =
        items.length === limit ? items[items.length - 1].id : undefined;

      const totalCount = await ctx.db
        .select({ count: sql`count(*)::int` })
        .from(projects)
        .then((res) => Number(res[0]?.count ?? 0));

      return {
        items,
        nextCursor,
        totalCount,
      };
    }),

  getProjectById: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          project: projects,
          creator: profiles,
        })
        .from(projects)
        .leftJoin(profiles, eq(projects.creator, profiles.userId))
        .where(eq(projects.id, input.id));

      if (result.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      const { project, creator } = result[0];

      return {
        ...project,
        creator,
      };
    }),
});
