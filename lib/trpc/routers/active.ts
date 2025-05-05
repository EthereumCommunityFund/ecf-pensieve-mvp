import { and, desc, eq, gt, gte, sql } from 'drizzle-orm';
import { z } from 'zod';

import dayjs from '@/lib/dayjs';
import { activeLogs, projects } from '@/lib/db/schema';

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

  getUserActivities: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId, limit, cursor } = input;

      const baseCondition = eq(activeLogs.userId, userId);
      const whereCondition = cursor
        ? and(baseCondition, gt(activeLogs.id, cursor))
        : baseCondition;

      const items = await ctx.db
        .select({
          activeLog: activeLogs,
          projectName: projects.name,
        })
        .from(activeLogs)
        .leftJoin(projects, eq(activeLogs.projectId, projects.id))
        .where(whereCondition)
        .orderBy(desc(activeLogs.createdAt))
        .limit(limit);

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
