import { sql } from 'drizzle-orm';

import { db } from '@/lib/db';

async function rollbackDappSmartContracts() {
  console.log(
    'Starting rollback of dappSmartContracts from JSONB to STRING...',
  );

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
        throw new Error(
          'Backup column not found! Cannot rollback without backup data.',
        );
      }

      // Step 2: Create temporary TEXT column
      console.log('Step 2: Creating temporary TEXT column...');
      await tx.execute(sql`
        ALTER TABLE projects 
        ADD COLUMN IF NOT EXISTS dapp_smart_contracts_rollback TEXT
      `);

      // Step 3: Restore data from backup
      console.log('Step 3: Restoring data from backup...');
      await tx.execute(sql`
        UPDATE projects 
        SET dapp_smart_contracts_rollback = dapp_smart_contracts_backup
      `);

      // Step 4: Drop JSONB column and rename TEXT column
      console.log('Step 4: Replacing JSONB column with TEXT column...');
      await tx.execute(sql`
        ALTER TABLE projects DROP COLUMN dapp_smart_contracts
      `);
      await tx.execute(sql`
        ALTER TABLE projects 
        RENAME COLUMN dapp_smart_contracts_rollback TO dapp_smart_contracts
      `);

      // Step 5: Verify rollback
      console.log('Step 5: Verifying rollback...');
      const result = await tx.execute(sql`
        SELECT 
          COUNT(*) as total_count,
          COUNT(dapp_smart_contracts) as restored_count,
          COUNT(dapp_smart_contracts_backup) as backup_count
        FROM projects
      `);

      const stats = (result as any[])[0] as any;
      console.log('\nRollback Statistics:');
      console.log(`Total projects: ${stats.total_count}`);
      console.log(
        `Projects with restored smart contracts: ${stats.restored_count}`,
      );
      console.log(`Projects with backup data: ${stats.backup_count}`);

      // Show samples
      const samples = await tx.execute(sql`
        SELECT 
          id,
          name,
          dapp_smart_contracts,
          dapp_smart_contracts_backup
        FROM projects 
        WHERE dapp_smart_contracts IS NOT NULL
        LIMIT 5
      `);

      console.log('\nSample restored data:');
      for (const sample of samples as any[]) {
        const s = sample as any;
        console.log(`Project ${s.id} (${s.name}):`);
        console.log(`  Restored: ${s.dapp_smart_contracts}`);
        console.log(`  Backup: ${s.dapp_smart_contracts_backup}`);
      }
    });

    console.log('\n✅ Rollback completed successfully!');
    console.log('Database has been restored to STRING format');
    console.log(
      'Backup data is still preserved in dapp_smart_contracts_backup column',
    );
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    console.error('Database may be in an inconsistent state');
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  rollbackDappSmartContracts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

export { rollbackDappSmartContracts };
