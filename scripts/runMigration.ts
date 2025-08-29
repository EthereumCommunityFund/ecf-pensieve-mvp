import 'dotenv/config';
import fs from 'fs';
import path from 'path';

import { sql } from 'drizzle-orm';

import { db } from '../lib/db';

async function runMigration() {
  try {
    console.log('Starting funding history migration...');

    const sqlFile = path.join(
      __dirname,
      'sql/20250827_migrate_funding_history.sql',
    );
    const sqlContent = fs.readFileSync(sqlFile, 'utf-8');

    await db.execute(sql.raw(sqlContent));

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
