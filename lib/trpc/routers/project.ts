import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { profiles, projects } from '@/lib/db/schema';
import { protectedProcedure, router } from '@/lib/trpc/server';

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

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        avatar_url: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedUser] = await ctx.db
        .update(profiles)
        .set({
          ...input,
        })
        .where(eq(profiles.userId, ctx.user.id))
        .returning();

      return updatedUser;
    }),
});
