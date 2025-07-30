-- Update dapp_smart_contracts column from TEXT to JSONB
-- This migration converts the existing smart contract data to a structured JSON format

-- Step 1: Create a temporary column to store the converted data
ALTER TABLE projects ADD COLUMN dapp_smart_contracts_new JSONB;

-- Step 2: Convert existing TEXT data to JSONB format
-- Old format: comma-separated addresses
-- New format: {"applicable": true, "contracts": [{"chain": "ethereum", "addresses": [...]}], "references": []}
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
            'addresses', array_to_json(array_remove(string_to_array(trim(dapp_smart_contracts), ','), ''))::jsonb
          )
        ),
        'references', '[]'::jsonb
      )
  END;

-- Step 3: Drop the old column
ALTER TABLE projects DROP COLUMN dapp_smart_contracts;

-- Step 4: Rename the new column to the original name
ALTER TABLE projects RENAME COLUMN dapp_smart_contracts_new TO dapp_smart_contracts;

-- Step 5: Create a GIN index for better JSONB query performance
CREATE INDEX idx_projects_dapp_smart_contracts ON projects USING gin(dapp_smart_contracts);

-- Add a comment to document the column structure
COMMENT ON COLUMN projects.dapp_smart_contracts IS 'Smart contract data in JSONB format: {applicable: boolean, contracts: [{chain: string, addresses: string[]}], references?: string[]}';