import { and, desc, eq, gte, lt, lte, or, sql } from 'drizzle-orm';
import { z } from 'zod';

import dayjs from '@/lib/dayjs';
import { activeLogs, likeRecords } from '@/lib/db/schema';

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
        cursor: z.string().datetime().optional(),
        type: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId, limit, cursor, type } = input;

      const baseCondition = eq(activeLogs.userId, userId);
      const conditions = [baseCondition];

      if (type === 'update') {
        conditions.push(
          eq(activeLogs.action, 'update'),
          eq(activeLogs.type, 'item_proposal'),
        );
      } else if (type === 'proposal') {
        const proposalTypeCondition = or(
          eq(activeLogs.type, 'proposal'),
          eq(activeLogs.type, 'item_proposal'),
        );
        if (proposalTypeCondition) {
          conditions.push(proposalTypeCondition);
        }
      } else if (type) {
        conditions.push(eq(activeLogs.type, type));
      }

      const whereCondition = cursor
        ? and(...conditions, lte(activeLogs.createdAt, new Date(cursor)))
        : and(...conditions);

      const logs = await ctx.db.query.activeLogs.findMany({
        with: {
          project: true,
          proposalCreator: true,
        },
        where: whereCondition,
        orderBy: desc(activeLogs.createdAt),
        limit: limit + 1,
      });

      const hasNextPage = logs.length > limit;
      const items = hasNextPage ? logs.slice(0, limit) : logs;

      const mappedItems = items.map((log) => ({
        activeLog: log,
        projectName: log.project?.name,
      }));

      const nextCursor = hasNextPage
        ? items[items.length - 1].createdAt.toISOString()
        : undefined;

      const totalCount = await ctx.db
        .select({ count: sql`count(*)::int` })
        .from(activeLogs)
        .where(baseCondition)
        .then((res) => Number(res[0]?.count ?? 0));

      return {
        items: mappedItems,
        nextCursor,
        totalCount,
        hasNextPage,
      };
    }),

  getUserVotedProjects: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId, limit, cursor } = input;

      const baseCondition = eq(likeRecords.creator, userId);
      const whereCondition = cursor
        ? and(baseCondition, lt(likeRecords.projectId, cursor))
        : baseCondition;

      const likedProjects = await ctx.db.query.likeRecords.findMany({
        with: {
          project: true,
        },
        where: whereCondition,
        orderBy: desc(likeRecords.projectId),
        limit: limit + 1,
      });

      const hasNextPage = likedProjects.length > limit;
      const items = hasNextPage ? likedProjects.slice(0, limit) : likedProjects;

      const mappedItems = items.map((record) => ({
        project: record.project,
        lastLikeAt: record.createdAt,
        weight: record.weight,
      }));

      const nextCursor =
        hasNextPage && items.length > 0
          ? items[items.length - 1].projectId
          : undefined;

      const totalCount = await ctx.db
        .select({ count: sql`COUNT(*)::int` })
        .from(likeRecords)
        .where(baseCondition)
        .then((res) => Number(res[0]?.count ?? 0));

      return {
        items: mappedItems,
        nextCursor,
        totalCount,
        hasNextPage,
      };
    }),
});
