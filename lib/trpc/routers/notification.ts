import { TRPCError } from '@trpc/server';
import { and, desc, eq, inArray, isNotNull, isNull, lt } from 'drizzle-orm';
import { z } from 'zod';

import { notifications, profiles } from '@/lib/db/schema';
import {
  checkAdminWhitelist,
  type AdminWhitelistCheckResult,
} from '@/lib/services/adminWhitelist';
import {
  enqueueBroadcastNotification,
  type BroadcastNotificationType,
} from '@/lib/services/notification';
import { protectedProcedure, router } from '@/lib/trpc/server';
import type { NotificationMetadata } from '@/types/notification';

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
        columns: {
          id: true,
          createdAt: true,
          userId: true,
          projectId: true,
          proposalId: true,
          itemProposalId: true,
          type: true,
          reward: true,
          voter_id: true,
          readAt: true,
          archivedAt: true,
          metadata: true,
        },
        where: and(...whereConditions),
        orderBy: [desc(notifications.id)],
        limit: limit + 1,
        with: {
          project: {
            columns: {
              id: true,
              name: true,
              logoUrl: true,
              shortCode: true,
            },
          },
          projectSnaps: {
            columns: {
              items: true,
            },
          },
          proposal: {
            columns: {
              items: true,
            },
            with: {
              creator: {
                columns: {
                  userId: true,
                  name: true,
                  address: true,
                },
              },
            },
          },
          itemProposal: {
            columns: {
              key: true,
            },
            with: {
              creator: {
                columns: {
                  userId: true,
                  name: true,
                  address: true,
                  avatarUrl: true,
                },
              },
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

  broadcastNotification: protectedProcedure
    .input(
      z.object({
        type: z.enum(['systemUpdate', 'newItemsAvailable']),
        title: z.string().min(1, 'title is required').max(200),
        body: z.string().min(1, 'body is required').max(5000),
        callToActionLabel: z
          .string()
          .max(80, 'call to action label is too long')
          .optional()
          .or(z.literal('').transform(() => undefined)),
        callToActionUrl: z
          .string()
          .transform((value) => {
            const trimmed = value?.trim();
            return trimmed ? trimmed : undefined;
          })
          .refine(
            (value) => {
              if (!value) return true;
              return /^https?:\/\//i.test(value) || value.startsWith('/');
            },
            {
              message: 'URL must start with http(s):// or /',
            },
          )
          .optional(),
        targetUrl: z
          .string()
          .transform((value) => {
            const trimmed = value?.trim();
            return trimmed ? trimmed : undefined;
          })
          .refine(
            (value) => {
              if (!value) return true;
              return /^https?:\/\//i.test(value) || value.startsWith('/');
            },
            {
              message: 'URL must start with http(s):// or /',
            },
          )
          .optional(),
        targetProjectId: z
          .union([z.string(), z.number()])
          .transform((value) => {
            if (value === undefined || value === null || value === '') {
              return undefined;
            }
            const parsed = typeof value === 'string' ? Number(value) : value;
            if (!Number.isFinite(parsed)) {
              throw new Error('targetProjectId must be a number');
            }
            return parsed;
          })
          .optional(),
        targetItemId: z
          .union([z.string(), z.number()])
          .transform((value) => {
            if (value === undefined || value === null || value === '') {
              return undefined;
            }
            const parsed = typeof value === 'string' ? Number(value) : value;
            if (!Number.isFinite(parsed)) {
              throw new Error('targetItemId must be a number');
            }
            return parsed;
          })
          .optional(),
        extra: z.record(z.any()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.query.profiles.findFirst({
        columns: {
          address: true,
        },
        where: eq(profiles.userId, ctx.user.id),
      });

      const whitelistResult: AdminWhitelistCheckResult | null = profile?.address
        ? await checkAdminWhitelist(profile.address, ctx.db)
        : null;

      if (
        !whitelistResult?.isWhitelisted ||
        !whitelistResult.normalizedAddress ||
        whitelistResult.entry?.isDisabled
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Wallet is not authorized to broadcast notifications',
        });
      }

      const metadata: NotificationMetadata = {
        title: input.title,
        body: input.body,
        ctaLabel: input.callToActionLabel,
        ctaUrl: input.callToActionUrl,
        targetUrl: input.targetUrl,
        targetProjectId: input.targetProjectId,
        targetItemId: input.targetItemId,
        extra: input.extra,
        operatorWallet: whitelistResult.normalizedAddress,
        operatorUserId: ctx.user.id,
      };

      await enqueueBroadcastNotification(
        {
          type: input.type as BroadcastNotificationType,
          metadata,
          projectId: input.targetProjectId ?? null,
          operatorId: ctx.user.id,
          operatorWallet: whitelistResult.normalizedAddress,
        },
        {
          priority: 10,
        },
      );

      return { success: true };
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
