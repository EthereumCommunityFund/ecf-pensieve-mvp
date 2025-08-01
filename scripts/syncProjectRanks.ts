#!/usr/bin/env tsx

import { config } from 'dotenv';

config();

import { eq } from 'drizzle-orm';

import { db } from '../lib/db';
import { projects, ranks } from '../lib/db/schema';
import { calculatePublishedGenesisWeight } from '../lib/utils/rankUtils';

async function syncProjectRanks() {
  try {
    console.log('Starting project ranks synchronization...');

    const publishedProjects = await db
      .select({
        id: projects.id,
        itemsTopWeight: projects.itemsTopWeight,
      })
      .from(projects)
      .where(eq(projects.isPublished, true));

    console.log(`Found ${publishedProjects.length} published projects`);

    let syncedCount = 0;
    let errorCount = 0;

    for (const project of publishedProjects) {
      try {
        const publishedGenesisWeight = calculatePublishedGenesisWeight(
          Object.keys(project.itemsTopWeight || {}),
        );

        console.log(
          `Project ${project.id}: itemsTopWeight=[${Object.keys(project.itemsTopWeight || {}).join(', ')}], weight=${publishedGenesisWeight}`,
        );

        const existingRank = await db
          .select()
          .from(ranks)
          .where(eq(ranks.projectId, project.id))
          .limit(1);

        if (existingRank.length > 0) {
          await db
            .update(ranks)
            .set({
              publishedGenesisWeight,
            })
            .where(eq(ranks.projectId, project.id));

          console.log(`Updated rank for project ${project.id}`);
        } else {
          await db.insert(ranks).values({
            projectId: project.id,
            publishedGenesisWeight,
          });

          console.log(`Created rank for project ${project.id}`);
        }

        syncedCount++;
      } catch (error) {
        console.error(`Error syncing project ${project.id}:`, error);
        errorCount++;
      }
    }

    console.log(
      `Sync completed: ${syncedCount} projects synced, ${errorCount} errors`,
    );

    const ranksSummary = await db
      .select({
        projectId: ranks.projectId,
        publishedGenesisWeight: ranks.publishedGenesisWeight,
      })
      .from(ranks)
      .orderBy(ranks.publishedGenesisWeight);

    console.log('\nRanks summary:');
    ranksSummary.forEach((rank) => {
      console.log(
        `Project ${rank.projectId}: ${rank.publishedGenesisWeight} points`,
      );
    });
  } catch (error) {
    console.error('Failed to sync project ranks:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  syncProjectRanks()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { syncProjectRanks };
