#!/usr/bin/env tsx

import { config } from 'dotenv';

config();

import { count, isNotNull, isNull, or, sql } from 'drizzle-orm';

import { db } from '../lib/db';
import { projectSnaps } from '../lib/db/schema';

async function updateProjectSnap() {
  try {
    console.log('Starting project_snaps name and categories update...');

    const countResult = await db
      .select({ count: count() })
      .from(projectSnaps)
      .where(or(isNull(projectSnaps.categories), isNull(projectSnaps.name)));

    const recordCount = countResult[0].count;
    console.log(`Found ${recordCount} records to update (name or categories)`);

    if (recordCount === 0) {
      console.log('No records need updating');
      return;
    }

    await db.execute(
      sql`UPDATE project_snaps SET items = items WHERE name IS NULL OR categories IS NULL`,
    );

    console.log(`Update operation completed`);
    console.log(
      'Name and categories fields have been populated via trigger functions',
    );

    const verifyNameResult = await db
      .select({ count: count() })
      .from(projectSnaps)
      .where(isNotNull(projectSnaps.name));

    const verifyCategories = await db
      .select({ count: count() })
      .from(projectSnaps)
      .where(isNotNull(projectSnaps.categories));

    const nameCount = verifyNameResult[0].count;
    const categoriesCount = verifyCategories[0].count;

    console.log(`Verification: ${nameCount} records now have name data`);
    console.log(
      `Verification: ${categoriesCount} records now have categories data`,
    );
  } catch (error) {
    console.error('Failed to update project_snaps name and categories:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  updateProjectSnap()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { updateProjectSnap };
