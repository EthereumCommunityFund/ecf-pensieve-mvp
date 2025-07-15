import { desc, eq, getTableColumns, lt, sql } from 'drizzle-orm';
import { unstable_cache as nextCache } from 'next/cache';
import { z } from 'zod';

import { CACHE_TAGS } from '@/lib/constants';
import { profiles, projects, projectSnaps, ranks } from '@/lib/db/schema';
import { publicProcedure, router } from '@/lib/trpc/server';

export const rankRouter = router({
  getTopRanks: publicProcedure.query(async ({ ctx }) => {
    const limit = 5;

    const getTopRanksData = async () => {
      const topRanksByGenesisWeight = await ctx.db.query.ranks.findMany({
        with: {
          project: {
            with: {
              creator: true,
              projectSnap: true,
            },
          },
        },
        orderBy: desc(ranks.publishedGenesisWeight),
        limit,
      });

      const itemsTopWeightSum = sql<number>`
        CASE
          WHEN ${projects.itemsTopWeight} IS NULL THEN 0
          ELSE COALESCE((
            SELECT SUM(CAST(value AS NUMERIC))
            FROM jsonb_each_text(${projects.itemsTopWeight})
          ), 0)
        END
      `;

      const topRanksBySupport = await ctx.db
        .select({
          ...(({ creator: _, ...rest }) => rest)(getTableColumns(projects)),
          creator: getTableColumns(profiles),
          itemsTopWeightSum,
        })
        .from(projects)
        .leftJoin(profiles, eq(projects.creator, profiles.userId))
        .leftJoin(projectSnaps, eq(projects.id, projectSnaps.projectId))
        .where(eq(projects.isPublished, true))
        .orderBy(desc(projects.support), desc(itemsTopWeightSum))
        .limit(limit);

      return {
        byGenesisWeight: topRanksByGenesisWeight,
        bySupport: topRanksBySupport.map(
          ({ itemsTopWeightSum, ...project }) => project,
        ),
      };
    };

    const getCachedTopRanks = nextCache(getTopRanksData, ['top-ranks'], {
      revalidate: 86400,
      tags: [CACHE_TAGS.RANKS],
    });

    return getCachedTopRanks();
  }),

  getTopRanksByGenesisWeightPaginated: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(10),
          cursor: z.number().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const cursor = input?.cursor;

      const getTopRanksData = async () => {
        const whereCondition = cursor
          ? lt(ranks.publishedGenesisWeight, cursor)
          : undefined;

        const results = await ctx.db.query.ranks.findMany({
          with: {
            project: {
              with: {
                creator: true,
                projectSnap: true,
              },
            },
          },
          where: whereCondition,
          orderBy: desc(ranks.publishedGenesisWeight),
          limit: limit + 1,
        });

        const hasNextPage = results.length > limit;
        const items = hasNextPage ? results.slice(0, limit) : results;
        const nextCursor = hasNextPage
          ? items[items.length - 1].publishedGenesisWeight
          : undefined;

        return {
          items,
          nextCursor,
          hasNextPage,
        };
      };

      if (!cursor) {
        const getCachedTopRanks = nextCache(
          getTopRanksData,
          [`top-ranks-genesis-weight-${limit}-first-page`],
          {
            revalidate: 86400,
            tags: [CACHE_TAGS.RANKS],
          },
        );
        return getCachedTopRanks();
      }

      return getTopRanksData();
    }),

  getTopRanksBySupportPaginated: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(10),
          cursor: z.number().optional(), // offset -> cursor
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const offset = input?.cursor ?? 0; // offset -> cursor

      const getTopRanksData = async () => {
        const itemsTopWeightSum = sql<number>`
          CASE
            WHEN ${projects.itemsTopWeight} IS NULL THEN 0
            ELSE COALESCE((
              SELECT SUM(CAST(value AS NUMERIC))
              FROM jsonb_each_text(${projects.itemsTopWeight})
            ), 0)
          END
        `;

        const results = await ctx.db
          .select({
            ...(({ creator: _, ...rest }) => rest)(getTableColumns(projects)),
            creator: getTableColumns(profiles),
            itemsTopWeightSum,
          })
          .from(projects)
          .leftJoin(profiles, eq(projects.creator, profiles.userId))
          .leftJoin(projectSnaps, eq(projects.id, projectSnaps.projectId))
          .where(eq(projects.isPublished, true))
          .orderBy(
            desc(projects.support),
            desc(itemsTopWeightSum),
            desc(projects.id),
          )
          .limit(limit + 1)
          .offset(offset);

        const hasNextPage = results.length > limit;
        const items = hasNextPage ? results.slice(0, limit) : results;
        const nextOffset = hasNextPage ? offset + limit : undefined;

        return {
          items: items.map(({ itemsTopWeightSum, ...project }) => project),
          nextCursor: nextOffset,
          hasNextPage,
        };
      };

      if (offset === 0) {
        const getCachedTopRanks = nextCache(
          getTopRanksData,
          [`top-ranks-support-${limit}-first-page`],
          {
            revalidate: 86400,
            tags: [CACHE_TAGS.RANKS],
          },
        );
        return getCachedTopRanks();
      }

      return getTopRanksData();
    }),
});
