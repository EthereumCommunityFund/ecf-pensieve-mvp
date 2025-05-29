import { and, desc, eq, gt, gte, lte, sql } from 'drizzle-orm';
import { z } from 'zod';

import dayjs from '@/lib/dayjs';
import { activeLogs } from '@/lib/db/schema';

import { publicProcedure, router } from '../server';

export const activeRouter = router({
  getUserDailyActivities: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = input.userId;
      const { startDate, endDate } = input;

      const conditions = [eq(activeLogs.userId, userId)];

      if (startDate) {
        conditions.push(
          gte(activeLogs.createdAt, dayjs.utc(startDate).toDate()),
        );
      } else {
        const oneYearAgo = dayjs.utc().subtract(1, 'year').toDate();
        conditions.push(gte(activeLogs.createdAt, oneYearAgo));
      }

      if (endDate) {
        conditions.push(
          lte(activeLogs.createdAt, dayjs.utc(endDate).endOf('day').toDate()),
        );
      }

      const queryCondition = and(...conditions);

      const dailyActivities = await ctx.db
        .select({
          date: sql<string>`TO_CHAR(${activeLogs.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`,
          count: sql<number>`COUNT(${activeLogs.id})`,
        })
        .from(activeLogs)
        .where(queryCondition)
        .groupBy(
          sql`TO_CHAR(${activeLogs.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`,
        )
        .orderBy(
          sql`TO_CHAR(${activeLogs.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`,
        );

      return dailyActivities.map((activity) => ({
        day: activity.date,
        value: Number(activity.count),
      }));
    }),

  getUserActivities: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().uuid().optional(),
        type: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId, limit, cursor, type } = input;

      const baseCondition = eq(activeLogs.userId, userId);
      const conditions = [baseCondition];
      if (type) {
        conditions.push(eq(activeLogs.type, type));
      }
      const whereCondition = cursor
        ? and(...conditions, gt(activeLogs.id, cursor))
        : and(...conditions);

      const logs = await ctx.db.query.activeLogs.findMany({
        with: {
          project: true,
          user: true,
        },
        where: whereCondition,
        orderBy: desc(activeLogs.createdAt),
        limit,
      });

      const items = logs.map((log) => ({
        activeLog: log,
        projectName: log.project?.name,
      }));

      const nextCursor =
        items.length === limit
          ? items[items.length - 1].activeLog.id
          : undefined;

      const totalCount = await ctx.db
        .select({ count: sql`count(*)::int` })
        .from(activeLogs)
        .where(baseCondition)
        .then((res) => Number(res[0]?.count ?? 0));

      return {
        items,
        nextCursor,
        totalCount,
      };
    }),
});
