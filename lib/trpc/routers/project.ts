import { TRPCError } from '@trpc/server';
import { and, desc, eq, gt, sql } from 'drizzle-orm';
import { z } from 'zod';

import {
  ESSENTIAL_ITEM_AMOUNT,
  ESSENTIAL_ITEM_WEIGHT_AMOUNT,
  QUORUM_AMOUNT,
  REWARD_PERCENT,
} from '@/lib/constants';
import { profiles, projects } from '@/lib/db/schema';
import { logUserActivity } from '@/lib/services/activeLogsService';
import { protectedProcedure, publicProcedure, router } from '@/lib/trpc/server';

import { proposalRouter } from './proposal';

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
        tags: z.array(z.string()).min(1, 'At least one tag is required'),
        whitePaper: z.string().min(1, 'White paper cannot be empty'),
        dappSmartContracts: z
          .string()
          .min(1, 'Dapp smart contracts cannot be empty'),
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

      const caller = proposalRouter.createCaller(ctx);
      try {
        const proposalItems = Object.entries(input)
          .filter(([key]) => key !== 'refs')
          .map(([key, value]) => {
            return { key, value };
          });

        await caller.createProposal({
          projectId: project.id,
          items: proposalItems,
          ...(input.refs && { refs: input.refs }),
        });

        const userProfile = await ctx.db.query.profiles.findFirst({
          where: eq(profiles.userId, ctx.user.id),
        });

        await ctx.db
          .update(profiles)
          .set({
            weight:
              (userProfile!.weight ?? 0) +
              ESSENTIAL_ITEM_WEIGHT_AMOUNT * REWARD_PERCENT,
          })
          .where(eq(profiles.userId, ctx.user.id));

        logUserActivity.project.create({
          userId: ctx.user.id,
          targetId: project.id,
          projectId: project.id,
        });
      } catch (proposalError) {
        ctx.db.delete(projects).where(eq(projects.id, project.id));
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            'Failed to create the initial proposal for the project. The project creation has been rolled back.',
          cause: proposalError,
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

      const queryOptions: any = {
        creator: true,
      };

      if (!isPublished) {
        queryOptions.proposals = {
          with: {
            voteRecords: {
              with: {
                creator: true,
              },
            },
            creator: true,
          },
        };
      }

      const results = await ctx.db.query.projects.findMany({
        with: queryOptions,
        where: whereCondition,
        orderBy: desc(projects.id),
        limit,
      });

      const nextCursor =
        results.length === limit ? results[results.length - 1].id : undefined;

      const totalCount = await ctx.db
        .select({ count: sql`count(*)::int` })
        .from(projects)
        .then((res) => Number(res[0]?.count ?? 0));

      return {
        items: results,
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
      const project = await ctx.db.query.projects.findFirst({
        with: {
          creator: true,
          proposals: {
            with: {
              voteRecords: true,
              creator: true,
            },
          },
        },
        where: eq(projects.id, input.id),
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      return project;
    }),

  scanPendingProject: publicProcedure.query(async ({ ctx }) => {
    const pendingProjects = await ctx.db.query.projects.findMany({
      where: eq(projects.isPublished, false),
      with: {
        proposals: {
          with: {
            voteRecords: true,
            creator: true,
          },
        },
      },
    });

    const filteredProjects = pendingProjects.filter((project) => {
      return project.proposals.some(
        (proposal) =>
          proposal.voteRecords.length >= ESSENTIAL_ITEM_AMOUNT * QUORUM_AMOUNT,
      );
    });

    return filteredProjects;
  }),
});
