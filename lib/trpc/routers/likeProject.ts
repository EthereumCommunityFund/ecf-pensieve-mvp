import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { likeRecords, projects } from '@/lib/db/schema';
import { logUserActivity } from '@/lib/services/activeLogsService';
import { getUserAvailableWeight } from '@/lib/services/userWeightService';

import { protectedProcedure, router } from '../server';

export const likeProjectRouter = router({
  getUserAvailableWeight: protectedProcedure.query(async ({ ctx }) => {
    const availableWeight = await getUserAvailableWeight(ctx.user.id);
    return { availableWeight };
  }),

  likeProject: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        weight: z.number().positive('Weight must be greater than 0'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { projectId, weight } = input;

      const [project, existingLikeRecord, availableWeight] = await Promise.all([
        ctx.db.query.projects.findFirst({
          where: eq(projects.id, projectId),
        }),
        ctx.db.query.likeRecords.findFirst({
          where: and(
            eq(likeRecords.projectId, projectId),
            eq(likeRecords.creator, ctx.user.id),
          ),
        }),
        getUserAvailableWeight(ctx.user.id),
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
          message: 'You have already liked this project',
        });
      }

      if (availableWeight < weight) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Insufficient weight. Available: ${availableWeight}, Requested: ${weight}`,
        });
      }

      return await ctx.db.transaction(async (tx) => {
        const [newLikeRecord] = await Promise.all([
          tx
            .insert(likeRecords)
            .values({
              projectId,
              creator: ctx.user.id,
              weight,
            })
            .returning(),
          tx
            .update(projects)
            .set({
              support: project.support + weight,
              likeCount: project.likeCount + 1,
            })
            .where(eq(projects.id, projectId)),
        ]);

        logUserActivity.like.create(
          {
            userId: ctx.user.id,
            targetId: newLikeRecord[0].id,
            projectId,
          },
          tx,
        );

        return newLikeRecord[0];
      });
    }),
});
