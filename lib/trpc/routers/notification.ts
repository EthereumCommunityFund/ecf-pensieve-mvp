import { TRPCError } from '@trpc/server';
import { and, desc, eq, inArray, isNotNull, isNull, lt } from 'drizzle-orm';
import { z } from 'zod';

import { notifications } from '@/lib/db/schema';
import { protectedProcedure, router } from '@/lib/trpc/server';

export const notificationRouter = router({
  getUserNotifications: protectedProcedure
    .input(
      z.object({
        filter: z.enum(['unread', 'archived']).optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { filter, limit, cursor } = input;

      const whereConditions = [eq(notifications.userId, ctx.user.id)];

      switch (filter) {
        case 'unread':
          whereConditions.push(isNull(notifications.readAt));
          whereConditions.push(isNull(notifications.archivedAt));
          break;
        case 'archived':
          whereConditions.push(isNotNull(notifications.archivedAt));
          break;
      }

      if (cursor) {
        whereConditions.push(lt(notifications.id, cursor));
      }

      const userNotifications = await ctx.db.query.notifications.findMany({
        where: and(...whereConditions),
        orderBy: [desc(notifications.id)],
        limit: limit + 1,
        with: {
          projectSnaps: {
            columns: {
              items: true,
            },
          },
          proposal: {
            columns: {
              items: true,
            },
          },
          itemProposal: {
            columns: {
              key: true,
            },
          },
          voter: {
            columns: {
              name: true,
              userId: true,
              address: true,
              avatarUrl: true,
            },
          },
        },
      });

      let hasMore = false;
      let nextCursor: number | undefined;

      if (userNotifications.length > limit) {
        hasMore = true;
        userNotifications.pop();
        nextCursor = userNotifications[userNotifications.length - 1]?.id;
      }

      return {
        notifications: userNotifications,
        hasMore,
        nextCursor,
      };
    }),

  markAsRead: protectedProcedure
    .input(z.object({ notificationIds: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      const updatedNotifications = await ctx.db
        .update(notifications)
        .set({
          readAt: new Date(),
        })
        .where(
          and(
            inArray(notifications.id, input.notificationIds),
            eq(notifications.userId, ctx.user.id),
          ),
        )
        .returning();

      if (updatedNotifications.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Notifications not found or do not belong to user',
        });
      }

      return updatedNotifications;
    }),

  archiveAllNotifications: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await ctx.db
      .update(notifications)
      .set({
        archivedAt: new Date(),
      })
      .where(
        and(
          eq(notifications.userId, ctx.user.id),
          isNull(notifications.archivedAt),
        ),
      );

    return result;
  }),
});
