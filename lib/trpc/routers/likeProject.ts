import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { logUserActivity } from '@/lib/services/activeLogsService';
import { likeRecords, profiles, projects } from '@/lib/db/schema';

import { protectedProcedure, router } from '../server';

export const likeProjectRouter = router({
  likeProject: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { projectId } = input;

      const [project, existingLikeRecord, userProfile] = await Promise.all([
        ctx.db.query.projects.findFirst({
          where: eq(projects.id, projectId),
        }),
        ctx.db.query.likeRecords.findFirst({
          where: and(
            eq(likeRecords.projectId, projectId),
            eq(likeRecords.creator, ctx.user.id),
          ),
        }),
        ctx.db.query.profiles.findFirst({
          where: eq(profiles.userId, ctx.user.id),
        }),
      ]);

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      if (existingLikeRecord) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Project already liked',
        });
      }

      return await ctx.db.transaction(async (tx) => {
        const [newLikeRecord] = await tx
          .insert(likeRecords)
          .values({
            projectId,
            creator: ctx.user.id,
          })
          .returning();

        await tx
          .update(projects)
          .set({
            support: project.support + (userProfile?.weight ?? 0),
          })
          .where(eq(projects.id, projectId));

        logUserActivity.like.create({
          userId: ctx.user.id,
          targetId: newLikeRecord.id,
          projectId,
        });

        return newLikeRecord;
      });
    }),
});
