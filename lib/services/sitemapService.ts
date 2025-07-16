import { sql } from 'drizzle-orm';

import { db, profiles, projects, proposals } from '@/lib/db';

export interface SitemapData {
  projects: Array<{
    id: number;
    updatedAt: Date;
    isPublished: boolean;
    latestItemProposalTime: Date | null;
  }>;
  profiles: Array<{
    address: string;
    updatedAt: Date;
  }>;
  proposals: Array<{
    id: number;
    projectId: number;
    createdAt: Date;
  }>;
}

export async function getSitemapData(): Promise<SitemapData> {
  const allProjects = await db
    .select({
      id: projects.id,
      updatedAt: projects.updatedAt,
      isPublished: projects.isPublished,
      latestItemProposalTime: sql<Date>`(
        SELECT MAX(created_at) 
        FROM item_proposals 
        WHERE project_id = ${projects.id}
      )`.as('latestItemProposalTime'),
    })
    .from(projects);

  const userProfiles = await db
    .select({
      address: profiles.address,
      updatedAt: profiles.updatedAt,
    })
    .from(profiles)
    .where(
      sql`${profiles.address} IS NOT NULL 
          AND ${profiles.address} != '' 
          AND ${profiles.address} != '0x0000000000000000000000000000000000000000'
          AND length(${profiles.address}) = 42`,
    );

  const allProposals = await db
    .select({
      id: proposals.id,
      projectId: proposals.projectId,
      createdAt: proposals.createdAt,
    })
    .from(proposals);

  return {
    projects: allProjects,
    profiles: userProfiles,
    proposals: allProposals,
  };
}
