import { and, eq, gte, sql } from 'drizzle-orm';
import { z } from 'zod';

import dayjs from '@/lib/dayjs';
import { activeLogs } from '@/lib/db/schema';

import { publicProcedure, router } from '../server';

export const activeRouter = router({
  getUserDailyActivities: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = input.userId;

      const oneYearAgo = dayjs.utc().subtract(1, 'year').toDate();

      const condition = and(
        eq(activeLogs.userId, userId),
        gte(activeLogs.createdAt, oneYearAgo),
      );

      const dailyActivities = await ctx.db
        .select({
          date: sql<string>`TO_CHAR(${activeLogs.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`,
          count: sql<number>`COUNT(${activeLogs.id})`,
        })
        .from(activeLogs)
        .where(condition)
        .groupBy(
          sql`TO_CHAR(${activeLogs.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`,
        )
        .orderBy(
          sql`TO_CHAR(${activeLogs.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`,
        );

      return dailyActivities.map((activity) => ({
        date: activity.date,
        count: Number(activity.count),
      }));
    }),
});
