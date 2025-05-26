import { TRPCError } from '@trpc/server';
import { and, desc, eq, inArray, isNull } from 'drizzle-orm';
import { z } from 'zod';

import { notifications } from '@/lib/db/schema';
import { protectedProcedure, router } from '@/lib/trpc/server';

export const notificationRouter = router({
  getUserNotifications: protectedProcedure.query(async ({ ctx }) => {
    const userNotifications = await ctx.db.query.notifications.findMany({
      where: and(
        eq(notifications.userId, ctx.user.id),
        isNull(notifications.readAt),
      ),
      orderBy: [desc(notifications.createdAt)],
      with: {
        project: true,
        proposal: true,
      },
    });

    return userNotifications;
  }),

  markAsRead: protectedProcedure
    .input(z.object({ notificationIds: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db
        .update(notifications)
        .set({
          readAt: new Date(),
        })
        .where(
          and(
            inArray(notifications.id, input.notificationIds),
            eq(notifications.userId, ctx.user.id),
          ),
        );

      if (!notification) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Notification not found or does not belong to user',
        });
      }

      return notification;
    }),
});
