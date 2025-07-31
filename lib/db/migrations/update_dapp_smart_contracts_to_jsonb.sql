-- Update dapp_smart_contracts column from TEXT to JSONB
-- This migration converts the existing smart contract data to a structured JSON format

-- Begin transaction to ensure atomicity
BEGIN;

-- Step 1: Create a temporary column to store the converted data
ALTER TABLE projects ADD COLUMN dapp_smart_contracts_new JSONB;

-- Step 2: Convert existing TEXT data to JSONB format
-- Old format: comma-separated addresses
-- New format: {"applicable": true, "contracts": [{"chain": "ethereum", "addresses": [...]}], "references": []}
UPDATE projects 
SET dapp_smart_contracts_new = 
  CASE 
    WHEN dapp_smart_contracts IS NULL OR trim(dapp_smart_contracts) = '' THEN 
      jsonb_build_object(
        'applicable', false,
        'contracts', '[]'::jsonb,
        'references', '[]'::jsonb
      )
    ELSE 
      jsonb_build_object(
        'applicable', true,
        'contracts', jsonb_build_array(
          jsonb_build_object(
            'chain', 'ethereum',
            'addresses', (
              SELECT jsonb_agg(DISTINCT trim(addr))
              FROM unnest(string_to_array(regexp_replace(dapp_smart_contracts, '\s+', ' ', 'g'), ',')) AS addr
              WHERE trim(addr) != '' AND trim(addr) ~ '^0x[a-fA-F0-9]{40}$'
            )
          )
        ),
        'references', '[]'::jsonb
      )
  END
WHERE dapp_smart_contracts_new IS NULL; -- Only update if not already migrated

-- Step 3: Drop the old column
ALTER TABLE projects DROP COLUMN dapp_smart_contracts;

-- Step 4: Rename the new column to the original name
ALTER TABLE projects RENAME COLUMN dapp_smart_contracts_new TO dapp_smart_contracts;

-- Step 5: Handle any NULL addresses arrays (edge case)
UPDATE projects 
SET dapp_smart_contracts = jsonb_set(
  dapp_smart_contracts,
  '{contracts,0,addresses}',
  '[]'::jsonb
)
WHERE dapp_smart_contracts->'contracts'->0->>'addresses' IS NULL
  AND jsonb_array_length(dapp_smart_contracts->'contracts') > 0;

-- Step 6: Create a GIN index for better JSONB query performance
CREATE INDEX IF NOT EXISTS idx_projects_dapp_smart_contracts ON projects USING gin(dapp_smart_contracts);

-- Step 7: Add a CHECK constraint to ensure data integrity
ALTER TABLE projects ADD CONSTRAINT check_dapp_smart_contracts_format
  CHECK (
    dapp_smart_contracts IS NULL OR (
      jsonb_typeof(dapp_smart_contracts) = 'object' AND
      dapp_smart_contracts ? 'applicable' AND
      dapp_smart_contracts ? 'contracts' AND
      jsonb_typeof(dapp_smart_contracts->'contracts') = 'array'
    )
  );

-- Add a comment to document the column structure
COMMENT ON COLUMN projects.dapp_smart_contracts IS 'Smart contract data in JSONB format: {applicable: boolean, contracts: [{chain: string, addresses: string[]}], references?: string[]}';

-- Commit the transaction
COMMIT;