import { and, desc, eq, getTableColumns, sql } from 'drizzle-orm';
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

      const genesisSupportScore = sql<number>`
        (${ranks.publishedGenesisWeight}) * sqrt(GREATEST(${projects.support}, 0))
      `;

      const topRanksByGenesisSupport = await ctx.db
        .select({
          rank: getTableColumns(ranks),
          project: getTableColumns(projects),
          creator: getTableColumns(profiles),
          projectSnap: getTableColumns(projectSnaps),
          genesisSupportScore,
        })
        .from(ranks)
        .innerJoin(projects, eq(ranks.projectId, projects.id))
        .leftJoin(profiles, eq(projects.creator, profiles.userId))
        .leftJoin(projectSnaps, eq(projects.id, projectSnaps.projectId))
        .where(eq(projects.isPublished, true))
        .orderBy(desc(genesisSupportScore), desc(ranks.id))
        .limit(limit);

      const topRanksBySupport = await ctx.db
        .select({
          ...(({ creator: _, ...rest }) => rest)(getTableColumns(projects)),
          creator: getTableColumns(profiles),
          projectSnap: getTableColumns(projectSnaps),
          itemsTopWeightSum,
        })
        .from(projects)
        .leftJoin(profiles, eq(projects.creator, profiles.userId))
        .leftJoin(projectSnaps, eq(projects.id, projectSnaps.projectId))
        .where(eq(projects.isPublished, true))
        .orderBy(desc(projects.support), desc(itemsTopWeightSum))
        .limit(limit);

      console.log(topRanksByGenesisSupport);

      return {
        byGenesisWeight: topRanksByGenesisWeight,
        byGenesisSupport: topRanksByGenesisSupport.map(
          ({ rank, project, creator, projectSnap, genesisSupportScore }) => ({
            ...rank,
            project: {
              ...project,
              creator,
              projectSnap,
            },
            genesisSupportScore,
          }),
        ),
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

  getTopRanksByGenesisSupportPaginated: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(10),
          cursor: z
            .object({
              score: z.number(),
              id: z.number(),
            })
            .optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const cursor = input?.cursor;

      const genesisSupportScore = sql<number>`
        (${ranks.publishedGenesisWeight}) * sqrt(GREATEST(${projects.support}, 0))
      `;

      const getTopRanksData = async () => {
        const whereCondition = cursor
          ? and(
              eq(projects.isPublished, true),
              sql`(${genesisSupportScore} < ${cursor.score} OR (${genesisSupportScore} = ${cursor.score} AND ${ranks.id} < ${cursor.id}))`,
            )
          : eq(projects.isPublished, true);

        const results = await ctx.db
          .select({
            rank: getTableColumns(ranks),
            project: getTableColumns(projects),
            creator: getTableColumns(profiles),
            projectSnap: getTableColumns(projectSnaps),
            genesisSupportScore,
          })
          .from(ranks)
          .innerJoin(projects, eq(ranks.projectId, projects.id))
          .leftJoin(profiles, eq(projects.creator, profiles.userId))
          .leftJoin(projectSnaps, eq(projects.id, projectSnaps.projectId))
          .where(whereCondition)
          .orderBy(desc(genesisSupportScore), desc(ranks.id))
          .limit(limit + 1);

        const hasNextPage = results.length > limit;
        const trimmedResults = hasNextPage ? results.slice(0, limit) : results;

        const nextCursor = hasNextPage
          ? {
              score:
                trimmedResults[trimmedResults.length - 1].genesisSupportScore,
              id: trimmedResults[trimmedResults.length - 1].rank.id,
            }
          : undefined;

        return {
          items: trimmedResults.map(
            ({ genesisSupportScore, rank, project, creator, projectSnap }) => ({
              ...rank,
              project: {
                ...project,
                creator,
                projectSnap,
              },
              genesisSupportScore,
            }),
          ),
          nextCursor,
          hasNextPage,
        };
      };

      return getTopRanksData();
    }),

  getTopRanksByGenesisWeightPaginated: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(10),
          cursor: z
            .object({
              weight: z.number(),
              id: z.number(),
            })
            .optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const cursor = input?.cursor;

      const getTopRanksData = async () => {
        const whereCondition = cursor
          ? sql`(${ranks.publishedGenesisWeight} < ${cursor.weight} OR (${ranks.publishedGenesisWeight} = ${cursor.weight} AND ${ranks.id} < ${cursor.id}))`
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
          orderBy: [desc(ranks.publishedGenesisWeight), desc(ranks.id)],
          limit: limit + 1,
        });

        const hasNextPage = results.length > limit;
        const items = hasNextPage ? results.slice(0, limit) : results;
        const nextCursor = hasNextPage
          ? {
              weight: items[items.length - 1].publishedGenesisWeight,
              id: items[items.length - 1].id,
            }
          : undefined;

        return {
          items,
          nextCursor,
          hasNextPage,
        };
      };

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
            projectSnap: getTableColumns(projectSnaps),
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
