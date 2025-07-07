import { and, desc, eq, gt } from 'drizzle-orm';
import { unstable_cache as nextCache } from 'next/cache';

import { CACHE_TAGS } from '@/lib/constants';
import { projects, ranks } from '@/lib/db/schema';
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

      const topRanksBySupport = await ctx.db.query.projects.findMany({
        with: {
          creator: true,
        },
        where: and(eq(projects.isPublished, true), gt(projects.support, 0)),
        orderBy: desc(projects.support),
        limit,
      });

      return {
        byGenesisWeight: topRanksByGenesisWeight,
        bySupport: topRanksBySupport,
      };
    };

    const getCachedTopRanks = nextCache(getTopRanksData, ['top-ranks'], {
      revalidate: 86400,
      tags: [CACHE_TAGS.RANKS],
    });

    return getCachedTopRanks();
  }),
});
