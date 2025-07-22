import { eq, isNull } from 'drizzle-orm';

import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { generateUniqueShortCode } from '@/lib/utils/shortCodeUtils';

async function addShortCodeToExistingProjects() {
  try {
    console.log('Starting to add short codes to existing projects...');

    const projectsWithoutShortCode = await db.query.projects.findMany({
      where: isNull(projects.shortCode),
      columns: {
        id: true,
        name: true,
      },
    });

    console.log(
      `Found ${projectsWithoutShortCode.length} projects without short codes`,
    );

    if (projectsWithoutShortCode.length === 0) {
      console.log('All projects already have short codes');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const project of projectsWithoutShortCode) {
      try {
        const shortCode = await generateUniqueShortCode(async (code) => {
          const existing = await db.query.projects.findFirst({
            where: eq(projects.shortCode, code),
          });
          return !!existing;
        });

        await db
          .update(projects)
          .set({ shortCode })
          .where(eq(projects.id, project.id));

        console.log(
          `✓ Added short code "${shortCode}" to project ${project.id}: ${project.name}`,
        );
        successCount++;
      } catch (error) {
        console.error(
          `✗ Failed to add short code to project ${project.id}: ${project.name}`,
          error,
        );
        errorCount++;
      }
    }

    console.log('\nSummary:');
    console.log(`Successfully updated: ${successCount} projects`);
    console.log(`Failed: ${errorCount} projects`);
    console.log('Script completed');
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  addShortCodeToExistingProjects()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}
