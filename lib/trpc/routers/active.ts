import { and, desc, eq, gte, lte, or, sql, type Column } from 'drizzle-orm';
import { z } from 'zod';

import dayjs from '@/lib/dayjs';
import { activeLogs, likeRecords } from '@/lib/db/schema';
import { getEstimatedCount } from '@/lib/utils/dbUtils';

import { publicProcedure, router } from '../server';

const DEFAULT_LOOKBACK_YEARS = 1;
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;

const ActivityType = z.enum(['update', 'proposal', 'project', 'item_proposal']);

type PaginationCondition = {
  baseCondition: any;
  cursor?: string;
  createdAtColumn: Column<any, any, any>;
};

function buildPaginationCondition({
  baseCondition,
  cursor,
  createdAtColumn,
}: PaginationCondition) {
  return cursor
    ? and(baseCondition, lte(createdAtColumn, new Date(cursor)))
    : baseCondition;
}

function buildDateConditions(startDate?: string, endDate?: string) {
  const conditions = [];

  if (startDate) {
    try {
      conditions.push(gte(activeLogs.createdAt, dayjs.utc(startDate).toDate()));
    } catch {
      throw new Error('Invalid start date format');
    }
  } else {
    const oneYearAgo = dayjs
      .utc()
      .subtract(DEFAULT_LOOKBACK_YEARS, 'year')
      .toDate();
    conditions.push(gte(activeLogs.createdAt, oneYearAgo));
  }

  if (endDate) {
    try {
      conditions.push(
        lte(activeLogs.createdAt, dayjs.utc(endDate).endOf('day').toDate()),
      );
    } catch {
      throw new Error('Invalid end date format');
    }
  }

  return conditions;
}

function buildActivityTypeConditions(type?: z.infer<typeof ActivityType>) {
  const conditions = [];

  if (type === 'update') {
    conditions.push(
      eq(activeLogs.action, 'update'),
      eq(activeLogs.type, 'item_proposal'),
    );
  } else if (type === 'proposal') {
    const proposalCondition = or(
      eq(activeLogs.type, 'proposal'),
      eq(activeLogs.type, 'item_proposal'),
    );
    if (proposalCondition) {
      conditions.push(proposalCondition);
    }
  } else if (type) {
    conditions.push(eq(activeLogs.type, type));
  }

  return conditions;
}

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
      const dateConditions = buildDateConditions(startDate, endDate);
      conditions.push(...dateConditions);

      const queryCondition = and(...conditions);

      const dailyActivities = await ctx.db
        .select({
          date: sql<Date>`DATE_TRUNC('day', ${activeLogs.createdAt} AT TIME ZONE 'UTC')`,
          count: sql<number>`COUNT(${activeLogs.id})`,
        })
        .from(activeLogs)
        .where(queryCondition)
        .groupBy(
          sql`DATE_TRUNC('day', ${activeLogs.createdAt} AT TIME ZONE 'UTC')`,
        )
        .orderBy(
          sql`DATE_TRUNC('day', ${activeLogs.createdAt} AT TIME ZONE 'UTC')`,
        );

      return dailyActivities.map((activity) => ({
        day: dayjs.utc(activity.date).format('YYYY-MM-DD'),
        value: Number(activity.count),
      }));
    }),

  getUserActivities: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
        cursor: z.string().datetime().optional(),
        type: ActivityType.optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId, limit, cursor, type } = input;

      const baseCondition = eq(activeLogs.userId, userId);
      const conditions = [baseCondition];
      const typeConditions = buildActivityTypeConditions(type);
      if (typeConditions.length > 0) {
        conditions.push(...typeConditions);
      }

      const whereCondition = buildPaginationCondition({
        baseCondition: and(...conditions),
        cursor,
        createdAtColumn: activeLogs.createdAt,
      });

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

      const totalCount = await getEstimatedCount(
        ctx.db,
        activeLogs,
        baseCondition,
      );

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
        limit: z.number().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
        cursor: z.string().datetime().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId, limit, cursor } = input;

      const baseCondition = eq(likeRecords.creator, userId);
      const whereCondition = buildPaginationCondition({
        baseCondition,
        cursor,
        createdAtColumn: likeRecords.createdAt,
      });

      const likedProjects = await ctx.db.query.likeRecords.findMany({
        with: {
          project: {
            with: {
              creator: true,
            },
          },
        },
        where: whereCondition,
        orderBy: desc(likeRecords.createdAt),
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
          ? items[items.length - 1].createdAt.toISOString()
          : undefined;

      const totalCount = await getEstimatedCount(
        ctx.db,
        likeRecords,
        baseCondition,
      );

      return {
        items: mappedItems,
        nextCursor,
        totalCount,
        hasNextPage,
      };
    }),
});
