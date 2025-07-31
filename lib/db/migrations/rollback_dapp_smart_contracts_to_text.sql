-- Rollback script for dapp_smart_contracts JSONB migration
-- This script reverts the column back to TEXT format

-- Begin transaction to ensure atomicity
BEGIN;

-- Step 1: Remove the CHECK constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS check_dapp_smart_contracts_format;

-- Step 2: Drop the GIN index
DROP INDEX IF EXISTS idx_projects_dapp_smart_contracts;

-- Step 3: Create a temporary column to store the converted data
ALTER TABLE projects ADD COLUMN dapp_smart_contracts_old TEXT;

-- Step 4: Convert JSONB data back to TEXT format (comma-separated addresses)
UPDATE projects 
SET dapp_smart_contracts_old = 
  CASE 
    WHEN dapp_smart_contracts IS NULL THEN NULL
    WHEN NOT (dapp_smart_contracts->'applicable')::boolean THEN NULL
    WHEN jsonb_array_length(dapp_smart_contracts->'contracts') = 0 THEN NULL
    ELSE (
      SELECT string_agg(addr, ', ')
      FROM (
        SELECT jsonb_array_elements_text(contract->'addresses') AS addr
        FROM jsonb_array_elements(dapp_smart_contracts->'contracts') AS contract
        WHERE contract->>'chain' = 'ethereum' -- Only take ethereum addresses for backward compatibility
        LIMIT 1
      ) AS addresses
    )
  END;

-- Step 5: Drop the JSONB column
ALTER TABLE projects DROP COLUMN dapp_smart_contracts;

-- Step 6: Rename the old column to the original name
ALTER TABLE projects RENAME COLUMN dapp_smart_contracts_old TO dapp_smart_contracts;

-- Step 7: Remove the column comment
COMMENT ON COLUMN projects.dapp_smart_contracts IS NULL;

-- Commit the transaction
COMMIT;