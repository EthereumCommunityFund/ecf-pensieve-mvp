import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';

import { CACHE_TAGS } from '@/lib/constants';
import { likeRecords, projects } from '@/lib/db/schema';
import { logUserActivity } from '@/lib/services/activeLogsService';
import { getUserAvailableWeight } from '@/lib/services/userWeightService';

import { protectedProcedure, router } from '../server';

const getProjectAndLikeRecord = async (
  db: any,
  projectId: number,
  userId: string,
) => {
  return await Promise.all([
    db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    }),
    db.query.likeRecords.findFirst({
      where: and(
        eq(likeRecords.projectId, projectId),
        eq(likeRecords.creator, userId),
      ),
    }),
  ]);
};

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

      const [[project, existingLikeRecord], availableWeight] =
        await Promise.all([
          getProjectAndLikeRecord(ctx.db, projectId, ctx.user.id),
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
        const [newLikeRecord] = await tx
          .insert(likeRecords)
          .values({
            projectId,
            creator: ctx.user.id,
            weight,
          })
          .returning();

        await Promise.all([
          tx
            .update(projects)
            .set({
              support: project.support + weight,
              likeCount: project.likeCount + 1,
            })
            .where(eq(projects.id, projectId)),
          logUserActivity.like.create(
            {
              userId: ctx.user.id,
              targetId: newLikeRecord.id,
              projectId,
            },
            tx,
          ),
        ]);

        revalidateTag(CACHE_TAGS.PROJECTS);

        return newLikeRecord;
      });
    }),

  updateLikeProject: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        weight: z.number().positive('Weight must be greater than 0'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { projectId, weight } = input;

      const [[project, existingLikeRecord], availableWeight] =
        await Promise.all([
          getProjectAndLikeRecord(ctx.db, projectId, ctx.user.id),
          getUserAvailableWeight(ctx.user.id),
        ]);

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      if (!existingLikeRecord) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have not liked this project yet',
        });
      }

      const currentWeight = existingLikeRecord.weight || 0;
      const additionalWeight = weight - currentWeight;

      if (availableWeight < additionalWeight) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Insufficient weight. Available: ${availableWeight}, Additional needed: ${additionalWeight}`,
        });
      }

      return await ctx.db.transaction(async (tx) => {
        const [updatedLikeRecord] = await tx
          .update(likeRecords)
          .set({ weight })
          .where(eq(likeRecords.id, existingLikeRecord.id))
          .returning();

        await Promise.all([
          tx
            .update(projects)
            .set({
              support: project.support + additionalWeight,
            })
            .where(eq(projects.id, projectId)),
          logUserActivity.like.update(
            {
              userId: ctx.user.id,
              targetId: existingLikeRecord.id,
              projectId,
            },
            tx,
          ),
        ]);

        revalidateTag(CACHE_TAGS.PROJECTS);

        return updatedLikeRecord;
      });
    }),

  withdrawLike: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { projectId } = input;

      const [project, existingLikeRecord] = await getProjectAndLikeRecord(
        ctx.db,
        projectId,
        ctx.user.id,
      );

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      if (!existingLikeRecord) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have not liked this project yet',
        });
      }

      const withdrawnWeight = existingLikeRecord.weight || 0;

      return await ctx.db.transaction(async (tx) => {
        await Promise.all([
          tx
            .delete(likeRecords)
            .where(eq(likeRecords.id, existingLikeRecord.id)),
          tx
            .update(projects)
            .set({
              support: project.support - withdrawnWeight,
              likeCount: project.likeCount - 1,
            })
            .where(eq(projects.id, projectId)),
          logUserActivity.like.delete(
            {
              userId: ctx.user.id,
              targetId: existingLikeRecord.id,
              projectId,
            },
            tx,
          ),
        ]);

        revalidateTag(CACHE_TAGS.PROJECTS);

        return { success: true, withdrawnWeight };
      });
    }),
});
