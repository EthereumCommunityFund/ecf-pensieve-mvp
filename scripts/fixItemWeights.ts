import { and, eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '@/lib/db/schema';
import { projectLogs, projects } from '@/lib/db/schema';

async function fixItemWeights() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  try {
    console.log('Starting to fix item weights for published projects...');

    // Get all published projects
    const publishedProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.isPublished, true));

    console.log(`Found ${publishedProjects.length} published projects`);

    for (const project of publishedProjects) {
      console.log(`\nProcessing project: ${project.name} (ID: ${project.id})`);

      // Use the same logic as getLeadingProposalsByProjectId
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
        })
        .from(latestLogsSubquery)
        .where(eq(latestLogsSubquery.rn, 1));

      // Calculate weights for each leading proposal
      const newItemWeights: Record<string, number> = {};

      for (const log of latestLogs) {
        const leadingProposal = await db.query.projectLogs.findMany({
          where: and(
            eq(projectLogs.projectId, Number(log.projectId)),
            eq(projectLogs.key, log.key ?? ''),
          ),
          with: {
            itemProposal: {
              with: {
                voteRecords: true,
                creator: true,
              },
            },
          },
          orderBy: (projectLogs, { desc }) => [desc(projectLogs.createdAt)],
        });

        const leadingProposalWeight = leadingProposal.reduce((acc, log) => {
          if (log.itemProposal && Array.isArray(log.itemProposal.voteRecords)) {
            const voteSum = log.itemProposal.voteRecords.reduce(
              (voteAcc, vote) => {
                voteAcc += vote.weight ?? 0;
                return voteAcc;
              },
              0,
            );
            acc += voteSum;
          }
          return acc;
        }, 0);

        newItemWeights[log.key ?? ''] = leadingProposalWeight;
      }

      // Update the project's itemsTopWeight
      await db
        .update(projects)
        .set({
          itemsTopWeight: newItemWeights,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, project.id));

      console.log(`  Updated itemsTopWeight for project ${project.id}`);
      console.log(`  New weights:`, newItemWeights);
    }

    console.log('\nItem weights fix completed successfully!');
  } catch (error) {
    console.error('Error fixing item weights:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the script
fixItemWeights().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
