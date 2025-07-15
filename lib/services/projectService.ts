import { eq, sql } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

import { db } from '@/lib/db';
import { profiles, projects, voteRecords } from '@/lib/db/schema';

export const getProjectForMeta = unstable_cache(
  async (id: number) => {
    try {
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, id),
        columns: {
          id: true,
          name: true,
          tagline: true,
          mainDescription: true,
          logoUrl: true,
          tags: true,
        },
      });

      // ✅ 项目不存在时返回 null，而不是抛出错误
      return project || null;
    } catch (error) {
      console.error('Failed to fetch project for meta:', error);

      // ✅ 数据库查询失败时也返回 null
      return null;
    }
  },
  ['project-meta'],
  {
    revalidate: 3600,
    tags: ['project-detail'],
  },
);

export interface HomePageStats {
  verifiedProjects: number;
  expertContributors: number;
  governanceVotes: number;
  pendingProjects: number;
}

async function fetchHomePageStatsFromDB(): Promise<HomePageStats | null> {
  try {
    const [
      verifiedProjectsResult,
      expertContributorsResult,
      governanceVotesResult,
      pendingProjectsResult,
    ] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(projects)
        .where(eq(projects.isPublished, true)),

      db
        .select({ count: sql<number>`count(*)` })
        .from(profiles)
        .where(
          sql`${profiles.address} IS NOT NULL 
              AND ${profiles.address} != '' 
              AND ${profiles.address} != '0x0000000000000000000000000000000000000000'
              AND length(${profiles.address}) = 42`,
        ),

      db.select({ count: sql<number>`count(*)` }).from(voteRecords),

      db
        .select({ count: sql<number>`count(*)` })
        .from(projects)
        .where(eq(projects.isPublished, false)),
    ]);

    return {
      verifiedProjects: verifiedProjectsResult[0]?.count ?? 0,
      expertContributors: expertContributorsResult[0]?.count ?? 0,
      governanceVotes: governanceVotesResult[0]?.count ?? 0,
      pendingProjects: pendingProjectsResult[0]?.count ?? 0,
    };
  } catch (error) {
    console.error('Failed to fetch homepage stats:', error);

    // ✅ 返回 null，让调用方决定如何处理
    return null;
  }
}

export const getHomePageStats = unstable_cache(
  fetchHomePageStatsFromDB,
  ['homepage-stats-daily'],
  {
    revalidate: 86400,
    tags: ['homepage-stats'],
  },
);
