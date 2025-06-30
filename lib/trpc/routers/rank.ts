import { desc } from 'drizzle-orm';
import { unstable_cache as nextCache } from 'next/cache';

import { CACHE_TAGS } from '@/lib/constants';
import { ranks } from '@/lib/db/schema';
import { publicProcedure, router } from '@/lib/trpc/server';

export const rankRouter = router({
  getTopRanks: publicProcedure.query(async ({ ctx }) => {
    const limit = 10;

    const getTopRanksData = async () => {
      const topRanks = await ctx.db.query.ranks.findMany({
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

      return topRanks;
    };

    const getCachedTopRanks = nextCache(getTopRanksData, ['top-ranks'], {
      revalidate: 86400,
      tags: [CACHE_TAGS.RANKS],
    });

    return getCachedTopRanks();
  }),
});
