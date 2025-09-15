import 'dotenv/config';
import fs from 'fs';
import path from 'path';

import { sql } from 'drizzle-orm';

import { db } from '../lib/db';

async function runEcosystemMigration() {
  try {
    console.log('Starting ecosystem relations migration...');

    const sqlFile = path.join(
      __dirname,
      'sql/20250909_migrate_ecosystem_history.sql',
    );

    if (!fs.existsSync(sqlFile)) {
      throw new Error(`SQL file not found: ${sqlFile}`);
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf-8');
    console.log('SQL file loaded successfully, executing migration...');

    // Use Drizzle transaction to ensure atomicity
    await db.transaction(async (tx) => {
      console.log('Transaction started');
      await tx.execute(sql.raw(sqlContent));
      console.log('Migration executed within transaction');
    });

    console.log('Ecosystem migration completed successfully!');
  } catch (error) {
    console.error('Ecosystem migration failed:', error);

    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }

    process.exit(1);
  }
}

runEcosystemMigration();
