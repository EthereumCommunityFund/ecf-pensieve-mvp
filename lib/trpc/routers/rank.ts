import { desc, eq, getTableColumns, sql } from 'drizzle-orm';
import { unstable_cache as nextCache } from 'next/cache';

import { CACHE_TAGS } from '@/lib/constants';
import { profiles, projects, ranks } from '@/lib/db/schema';
import { publicProcedure, router } from '@/lib/trpc/server';

export const rankRouter = router({
  getTopRanks: publicProcedure.query(async ({ ctx }) => {
    const limit = 10;

    const getTopRanksData = async () => {
      const topRanksByGenesisWeight = await ctx.db.query.ranks.findMany({
        with: {
          project: {
            with: {
              creator: true,
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
});
