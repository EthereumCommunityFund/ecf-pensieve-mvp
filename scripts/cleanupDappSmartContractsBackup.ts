import { sql } from 'drizzle-orm';

import { db } from '@/lib/db';

async function cleanupDappSmartContractsBackup() {
  console.log('Starting cleanup of dappSmartContracts backup data...');

  try {
    await db.transaction(async (tx) => {
      // Step 1: Check if backup column exists
      console.log('Step 1: Checking for backup column...');
      const backupCheck = await tx.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'projects' 
        AND column_name = 'dapp_smart_contracts_backup'
      `);

      if ((backupCheck as any[]).length === 0) {
        console.log('No backup column found. Nothing to clean up.');
        return;
      }

      // Step 2: Verify current data format is JSONB
      console.log('Step 2: Verifying current data format...');
      const typeCheck = await tx.execute(sql`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'projects' 
        AND column_name = 'dapp_smart_contracts'
      `);

      if ((typeCheck as any[]).length === 0) {
        throw new Error('dapp_smart_contracts column not found!');
      }

      const dataType = ((typeCheck as any[])[0] as any).data_type;
      if (dataType !== 'jsonb') {
        throw new Error(
          `Current column type is ${dataType}, not JSONB. Migration may not be complete.`,
        );
      }

      // Step 3: Validate data integrity
      console.log('Step 3: Validating data integrity...');
      const validation = await tx.execute(sql`
        SELECT 
          COUNT(*) as total_projects,
          COUNT(dapp_smart_contracts) as with_smart_contracts,
          COUNT(dapp_smart_contracts_backup) as with_backup,
          COUNT(CASE 
            WHEN dapp_smart_contracts IS NOT NULL 
            AND jsonb_typeof(dapp_smart_contracts) = 'array' 
            THEN 1 
          END) as valid_jsonb_arrays
        FROM projects
      `);

      const stats = (validation as any[])[0] as any;
      console.log('\nData Validation:');
      console.log(`Total projects: ${stats.total_projects}`);
      console.log(
        `Projects with smart contracts: ${stats.with_smart_contracts}`,
      );
      console.log(`Projects with backup data: ${stats.with_backup}`);
      console.log(`Valid JSONB arrays: ${stats.valid_jsonb_arrays}`);

      if (stats.with_smart_contracts !== stats.valid_jsonb_arrays) {
        throw new Error(
          'Some smart contracts data is not in valid JSONB array format!',
        );
      }

      // Step 4: Show final confirmation
      console.log(
        '\n⚠️  WARNING: This will permanently delete the backup data!',
      );
      console.log('Make sure you have tested the application thoroughly.');

      // Step 5: Drop backup column
      console.log('\nStep 4: Removing backup column...');
      await tx.execute(sql`
        ALTER TABLE projects DROP COLUMN dapp_smart_contracts_backup
      `);

      console.log('Backup column removed successfully.');
    });

    console.log('\n✅ Cleanup completed successfully!');
    console.log('Backup data has been permanently removed.');
    console.log('The migration is now finalized.');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    console.error('Backup data has NOT been removed');
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  // Add a confirmation prompt for safety
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    'Are you sure you want to permanently delete the backup data? (yes/no): ',
    (answer: string) => {
      rl.close();

      if (answer.toLowerCase() === 'yes') {
        cleanupDappSmartContractsBackup()
          .then(() => process.exit(0))
          .catch((error) => {
            console.error('Unhandled error:', error);
            process.exit(1);
          });
      } else {
        console.log('Cleanup cancelled.');
        process.exit(0);
      }
    },
  );
}

export { cleanupDappSmartContractsBackup };
