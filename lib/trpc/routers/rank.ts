import { desc, inArray } from 'drizzle-orm';
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

      const topProjectsBySupport = await ctx.db
        .select({ id: projects.id })
        .from(projects)
        .orderBy(desc(projects.support))
        .limit(limit);

      const topProjectIds = topProjectsBySupport.map((p) => p.id);

      const topRanksBySupport =
        topProjectIds.length > 0
          ? await ctx.db.query.ranks.findMany({
              where: inArray(ranks.projectId, topProjectIds),
              with: {
                project: {
                  with: {
                    creator: true,
                  },
                },
              },
            })
          : [];

      const orderedTopRanksBySupport = topProjectIds
        .map((id) => topRanksBySupport.find((rank) => rank.projectId === id))
        .filter(Boolean);

      return {
        byGenesisWeight: topRanksByGenesisWeight,
        bySupport: orderedTopRanksBySupport,
      };
    };

    const getCachedTopRanks = nextCache(getTopRanksData, ['top-ranks'], {
      revalidate: 86400,
      tags: [CACHE_TAGS.RANKS],
    });

    return getCachedTopRanks();
  }),
});
