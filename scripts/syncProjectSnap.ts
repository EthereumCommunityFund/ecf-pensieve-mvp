#!/usr/bin/env tsx

import { config } from 'dotenv';

config();

import { eq, sql } from 'drizzle-orm';

import { db } from '../lib/db';
import {
  itemProposals,
  profiles,
  projectLogs,
  projects,
  projectSnaps,
} from '../lib/db/schema';

async function syncProjectSnap() {
  try {
    console.log('Starting project snap synchronization...');

    const publishedProjects = await db
      .select({
        id: projects.id,
      })
      .from(projects)
      .where(eq(projects.isPublished, true));

    console.log(`Found ${publishedProjects.length} published projects`);

    for (const project of publishedProjects) {
      const latestLogsSubquery = db
        .select({
          id: projectLogs.id,
          projectId: projectLogs.projectId,
          key: projectLogs.key,
          itemProposalId: projectLogs.itemProposalId,
          createdAt: projectLogs.createdAt,
          isNotLeading: projectLogs.isNotLeading,
          rn: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${projectLogs.key} ORDER BY ${projectLogs.createdAt} DESC)`.as(
            'rn',
          ),
        })
        .from(projectLogs)
        .where(eq(projectLogs.projectId, project.id))
        .as('latest_logs');

      const latestLogs = await db
        .select({
          id: latestLogsSubquery.id,
          projectId: latestLogsSubquery.projectId,
          key: latestLogsSubquery.key,
          itemProposalId: latestLogsSubquery.itemProposalId,
          createdAt: latestLogsSubquery.createdAt,
          isNotLeading: latestLogsSubquery.isNotLeading,
          itemProposal: {
            id: itemProposals.id,
            key: itemProposals.key,
            value: itemProposals.value,
            ref: itemProposals.ref,
            creator: itemProposals.creator,
            reason: itemProposals.reason,
            createdAt: itemProposals.createdAt,
          },
          creator: {
            userId: profiles.userId,
            name: profiles.name,
            avatarUrl: profiles.avatarUrl,
            address: profiles.address,
          },
        })
        .from(latestLogsSubquery)
        .leftJoin(
          itemProposals,
          eq(latestLogsSubquery.itemProposalId, itemProposals.id),
        )
        .leftJoin(profiles, eq(itemProposals.creator, profiles.userId))
        .where(eq(latestLogsSubquery.rn, 1));

      const items = latestLogs.map((row) => {
        let value = row.itemProposal?.value;

        if (typeof value === 'string' && value !== '') {
          try {
            const parsed = JSON.parse(value);
            value = parsed;
          } catch {
            // If parsing fails, keep it as string
          }
        }

        return {
          key: row.key as string,
          value,
        };
      });

      console.log(`Syncing project snap for project ${project.id}`);

      await db.insert(projectSnaps).values({
        projectId: project.id,
        items,
      });
    }
  } catch (error) {
    console.error('Failed to sync project snap:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  syncProjectSnap()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { syncProjectSnap };
