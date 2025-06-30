import { desc } from 'drizzle-orm';

import { ranks } from '@/lib/db/schema';
import { publicProcedure, router } from '@/lib/trpc/server';

export const rankRouter = router({
  getTopRanks: publicProcedure.query(async ({ ctx }) => {
    const limit = 10;

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
  }),
});
