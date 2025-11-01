import { sql } from 'drizzle-orm';

import { db } from '@/lib/db';

async function migrateDappSmartContracts() {
  console.log('Starting dappSmartContracts migration from STRING to JSONB...');

  try {
    await db.transaction(async (tx) => {
      // Step 1: Add backup column
      console.log('Step 1: Adding backup column...');
      await tx.execute(sql`
        ALTER TABLE projects 
        ADD COLUMN IF NOT EXISTS dapp_smart_contracts_backup TEXT
      `);

      // Step 2: Backup current data
      console.log('Step 2: Backing up current data...');
      await tx.execute(sql`
        UPDATE projects 
        SET dapp_smart_contracts_backup = dapp_smart_contracts
        WHERE dapp_smart_contracts IS NOT NULL
      `);

      // Step 3: Add temporary JSONB column
      console.log('Step 3: Adding temporary JSONB column...');
      await tx.execute(sql`
        ALTER TABLE projects 
        ADD COLUMN IF NOT EXISTS dapp_smart_contracts_new JSONB
      `);

      // Step 4: Convert data from STRING to JSONB array format
      console.log('Step 4: Converting data to JSONB format...');
      await tx.execute(sql`
        UPDATE projects 
        SET dapp_smart_contracts_new = 
          CASE 
            WHEN dapp_smart_contracts IS NULL OR trim(dapp_smart_contracts) = '' THEN 
              NULL
            ELSE 
              jsonb_build_array(
                jsonb_build_object(
                  'chain', 'ethereum',
                  'addresses', trim(dapp_smart_contracts)
                )
              )
          END
      `);

      // Step 5: Drop old column and rename new column
      console.log('Step 5: Replacing old column with new column...');
      await tx.execute(sql`
        ALTER TABLE projects DROP COLUMN dapp_smart_contracts
      `);
      await tx.execute(sql`
        ALTER TABLE projects 
        RENAME COLUMN dapp_smart_contracts_new TO dapp_smart_contracts
      `);

      // Step 6: Verify migration
      console.log('Step 6: Verifying migration...');
      const result = await tx.execute(sql`
        SELECT 
          COUNT(*) as total_count,
          COUNT(dapp_smart_contracts) as migrated_count,
          COUNT(dapp_smart_contracts_backup) as backup_count
        FROM projects
      `);

      const stats = (result as any[])[0] as any;
      console.log('\nMigration Statistics:');
      console.log(`Total projects: ${stats.total_count}`);
      console.log(
        `Projects with smart contracts (migrated): ${stats.migrated_count}`,
      );
      console.log(`Projects with backup data: ${stats.backup_count}`);

      // Validate a few samples
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

      console.log('\nSample migrated data:');
      for (const sample of samples as any[]) {
        const s = sample as any;
        console.log(`Project ${s.id} (${s.name}):`);
        console.log(`  Original: ${s.dapp_smart_contracts_backup}`);
        console.log(`  Migrated: ${JSON.stringify(s.dapp_smart_contracts)}`);
      }
    });

    console.log('\n✅ Migration completed successfully!');
    console.log(
      'Note: Backup data is preserved in dapp_smart_contracts_backup column',
    );
    console.log(
      'Run cleanup script after verifying the migration is successful',
    );
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('No changes were made to the database');
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  migrateDappSmartContracts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

export { migrateDappSmartContracts };
