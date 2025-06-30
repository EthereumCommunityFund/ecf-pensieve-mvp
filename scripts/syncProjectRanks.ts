#!/usr/bin/env tsx

import { config } from 'dotenv';

config();

import { eq } from 'drizzle-orm';

import { WEIGHT } from '../lib/constants';
import { db } from '../lib/db';
import { projects, ranks } from '../lib/db/schema';
import { POC_ITEMS } from '../lib/pocItems';

function calculatePublishedGenesisWeight(hasProposalKeys: string[]): number {
  let totalWeight = 0;

  for (const key of hasProposalKeys) {
    if (key in POC_ITEMS) {
      const itemConfig = POC_ITEMS[key as keyof typeof POC_ITEMS];
      totalWeight += itemConfig.accountability_metric * WEIGHT;
    } else {
      console.warn(`Unknown item key: ${key}`);
    }
  }

  return totalWeight;
}

async function syncProjectRanks() {
  try {
    console.log('Starting project ranks synchronization...');

    const publishedProjects = await db
      .select({
        id: projects.id,
        hasProposalKeys: projects.hasProposalKeys,
      })
      .from(projects)
      .where(eq(projects.isPublished, true));

    console.log(`Found ${publishedProjects.length} published projects`);

    let syncedCount = 0;
    let errorCount = 0;

    for (const project of publishedProjects) {
      try {
        const publishedGenesisWeight = calculatePublishedGenesisWeight(
          project.hasProposalKeys || [],
        );

        console.log(
          `Project ${project.id}: hasProposalKeys=[${project.hasProposalKeys?.join(', ')}], weight=${publishedGenesisWeight}`,
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
              updatedAt: new Date(),
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

export { calculatePublishedGenesisWeight, syncProjectRanks };
