import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { projectNotificationSettings } from '@/lib/db/schema';
import { protectedProcedure, router } from '@/lib/trpc/server';

export const projectNotificationSettingsRouter = router({
  getProjectNotificationSetting: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const setting = await ctx.db.query.projectNotificationSettings.findFirst({
        where: and(
          eq(projectNotificationSettings.userId, ctx.user.id),
          eq(projectNotificationSettings.projectId, input.projectId),
        ),
      });

      // Return null instead of undefined for React Query compatibility
      return setting ?? null;
    }),

  updateProjectNotificationSetting: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        notificationMode: z.enum(['muted', 'my_contributions', 'all_events']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { projectId, notificationMode } = input;

      const project = await ctx.db.query.projects.findFirst({
        where: (projects, { eq }) => eq(projects.id, projectId),
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      const [result] = await ctx.db
        .insert(projectNotificationSettings)
        .values({
          userId: ctx.user.id,
          projectId,
          notificationMode,
        })
        .onConflictDoUpdate({
          target: [
            projectNotificationSettings.userId,
            projectNotificationSettings.projectId,
          ],
          set: {
            notificationMode,
            updatedAt: new Date(),
          },
        })
        .returning();

      return result;
    }),
});
