import { sql } from 'drizzle-orm';

import type { Database } from '..';

/**
 * Migration to update dapp_smart_contracts column from TEXT to JSONB
 * This converts existing smart contract data to a structured JSON format
 */
export async function up(db: Database) {
  // Step 1: Backup existing data
  await db.execute(sql`
    CREATE TEMP TABLE dapp_smart_contracts_backup AS 
    SELECT id, dapp_smart_contracts 
    FROM projects 
    WHERE dapp_smart_contracts IS NOT NULL
  `);

  // Step 2: Add new JSONB column
  await db.execute(sql`
    ALTER TABLE projects ADD COLUMN dapp_smart_contracts_new JSONB
  `);

  // Step 3: Convert existing TEXT data to JSONB format
  await db.execute(sql`
    UPDATE projects 
    SET dapp_smart_contracts_new = 
      CASE 
        WHEN dapp_smart_contracts IS NULL OR dapp_smart_contracts = '' THEN 
          jsonb_build_object(
            'applicable', true,
            'contracts', '[]'::jsonb,
            'references', '[]'::jsonb
          )
        ELSE 
          jsonb_build_object(
            'applicable', true,
            'contracts', jsonb_build_array(
              jsonb_build_object(
                'chain', 'ethereum',
                'addresses', array_to_json(
                  array_remove(
                    array(
                      SELECT trim(unnest(string_to_array(trim(dapp_smart_contracts), ',')))
                    ), 
                    ''
                  )
                )::jsonb
              )
            ),
            'references', '[]'::jsonb
          )
      END
  `);

  // Step 4: Drop the old column
  await db.execute(sql`
    ALTER TABLE projects DROP COLUMN dapp_smart_contracts
  `);

  // Step 5: Rename the new column to the original name
  await db.execute(sql`
    ALTER TABLE projects RENAME COLUMN dapp_smart_contracts_new TO dapp_smart_contracts
  `);

  // Step 6: Create a GIN index for better JSONB query performance
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_projects_dapp_smart_contracts 
    ON projects USING gin(dapp_smart_contracts)
  `);

  // Step 7: Add column comment
  await db.execute(sql`
    COMMENT ON COLUMN projects.dapp_smart_contracts IS 
    'Smart contract data in JSONB format: {applicable: boolean, contracts: [{chain: string, addresses: string[]}], references?: string[]}'
  `);
}

/**
 * Rollback function to revert the migration
 */
export async function down(db: Database) {
  // Step 1: Create TEXT column
  await db.execute(sql`
    ALTER TABLE projects ADD COLUMN dapp_smart_contracts_text TEXT
  `);

  // Step 2: Convert JSONB back to TEXT format (comma-separated addresses)
  await db.execute(sql`
    UPDATE projects 
    SET dapp_smart_contracts_text = (
      SELECT string_agg(address, ', ')
      FROM jsonb_array_elements(dapp_smart_contracts->'contracts') AS contract,
           jsonb_array_elements_text(contract->'addresses') AS address
    )
    WHERE dapp_smart_contracts IS NOT NULL 
      AND dapp_smart_contracts->>'applicable' = 'true'
      AND jsonb_array_length(dapp_smart_contracts->'contracts') > 0
  `);

  // Step 3: Drop the JSONB column
  await db.execute(sql`
    ALTER TABLE projects DROP COLUMN dapp_smart_contracts
  `);

  // Step 4: Rename TEXT column back
  await db.execute(sql`
    ALTER TABLE projects RENAME COLUMN dapp_smart_contracts_text TO dapp_smart_contracts
  `);

  // Step 5: Drop the index
  await db.execute(sql`
    DROP INDEX IF EXISTS idx_projects_dapp_smart_contracts
  `);
}