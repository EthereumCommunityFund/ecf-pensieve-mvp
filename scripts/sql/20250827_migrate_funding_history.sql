-- Historical data migration: Process the latest leading proposal for each project
-- Optimized version using CTE and batch insert based on trigger logic

DO $$
DECLARE
  v_count INTEGER := 0;
  v_project_count INTEGER := 0;
  v_error_count INTEGER := 0;
  v_total_relations INTEGER;
  v_org_count INTEGER;
  v_donator_count INTEGER;
  v_active_count INTEGER;
BEGIN
  RAISE NOTICE 'Starting funding history migration...';
  
  -- Use CTE for batch processing with set-based operations
  WITH latest_logs AS (
    -- Get the latest funding_received_grants leading proposal for each project
    SELECT DISTINCT ON (project_id) 
      pl.id,
      pl.project_id,
      pl.item_proposal_id,
      pl.key,
      pl.created_at,
      ip.value
    FROM project_logs pl
    INNER JOIN item_proposals ip ON ip.id = pl.item_proposal_id
    WHERE pl.key = 'funding_received_grants' 
      AND pl.is_not_leading = false
      AND ip.value IS NOT NULL
      AND jsonb_typeof(ip.value) = 'array'
    ORDER BY pl.project_id, pl.created_at DESC
  ),
  grants_expanded AS (
    -- Expand grants array for each project
    SELECT 
      ll.id AS project_log_id,
      ll.project_id,
      ll.item_proposal_id,
      elem AS grant
    FROM latest_logs ll,
         LATERAL jsonb_array_elements(ll.value) AS elem
  ),
  org_array_relations AS (
    -- Extract organization relations from array format
    SELECT DISTINCT
      ge.project_id AS source_project_id,
      elem_text AS target_project_id,
      'organization'::text AS relation_type,
      ge.item_proposal_id,
      ge.project_log_id
    FROM grants_expanded ge,
         LATERAL jsonb_array_elements_text(ge.grant->'organization') AS elem_text
    WHERE ge.grant ? 'organization'
      AND jsonb_typeof(ge.grant->'organization') = 'array'
  ),
  org_string_relations AS (
    -- Extract organization relations from string format
    SELECT DISTINCT
      ge.project_id AS source_project_id,
      ge.grant->>'organization' AS target_project_id,
      'organization'::text AS relation_type,
      ge.item_proposal_id,
      ge.project_log_id
    FROM grants_expanded ge
    WHERE ge.grant ? 'organization'
      AND jsonb_typeof(ge.grant->'organization') = 'string'
      AND ge.grant->>'organization' IS NOT NULL
      AND ge.grant->>'organization' != 'N/A'
  ),
  donator_relations AS (
    -- Extract donator relations (array format only)
    SELECT DISTINCT
      ge.project_id AS source_project_id,
      elem_text AS target_project_id,
      'donator'::text AS relation_type,
      ge.item_proposal_id,
      ge.project_log_id
    FROM grants_expanded ge,
         LATERAL jsonb_array_elements_text(ge.grant->'projectDonator') AS elem_text
    WHERE ge.grant ? 'projectDonator'
      AND jsonb_typeof(ge.grant->'projectDonator') = 'array'
  ),
  all_relations AS (
    -- Combine and filter valid numeric IDs
    SELECT * FROM org_array_relations WHERE target_project_id ~ '^\d+$'
    UNION ALL
    SELECT * FROM org_string_relations WHERE target_project_id ~ '^\d+$'
    UNION ALL
    SELECT * FROM donator_relations WHERE target_project_id ~ '^\d+$'
  ),
  inserted AS (
    -- Batch insert all relations
    INSERT INTO project_relations (
      source_project_id, 
      target_project_id, 
      relation_type,
      item_proposal_id, 
      project_log_id, 
      is_active
    )
    SELECT
      ar.source_project_id::bigint,
      ar.target_project_id::bigint,
      ar.relation_type,
      ar.item_proposal_id,
      ar.project_log_id,
      true
    FROM all_relations ar
    -- Check if target project exists
    WHERE EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = ar.target_project_id::bigint
    )
    ON CONFLICT (source_project_id, target_project_id, relation_type) 
    DO NOTHING
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_count FROM inserted;
  
  -- Count processed projects
  SELECT COUNT(DISTINCT project_id) INTO v_project_count
  FROM project_logs 
  WHERE key = 'funding_received_grants' 
    AND is_not_leading = false;
  
  -- Count invalid references (in a separate query since CTE is not available here)
  WITH latest_logs AS (
    SELECT DISTINCT ON (project_id) 
      pl.id,
      pl.project_id,
      pl.item_proposal_id,
      ip.value
    FROM project_logs pl
    INNER JOIN item_proposals ip ON ip.id = pl.item_proposal_id
    WHERE pl.key = 'funding_received_grants' 
      AND pl.is_not_leading = false
      AND ip.value IS NOT NULL
      AND jsonb_typeof(ip.value) = 'array'
    ORDER BY pl.project_id, pl.created_at DESC
  ),
  grants_expanded AS (
    SELECT 
      ll.project_id,
      elem AS grant
    FROM latest_logs ll,
         LATERAL jsonb_array_elements(ll.value) AS elem
  ),
  invalid_refs AS (
    -- Find invalid organization references
    SELECT DISTINCT 
      ge.project_id AS source_project_id,
      elem_text AS target_project_id
    FROM grants_expanded ge,
         LATERAL jsonb_array_elements_text(ge.grant->'organization') AS elem_text
    WHERE ge.grant ? 'organization'
      AND jsonb_typeof(ge.grant->'organization') = 'array'
      AND elem_text ~ '^\d+$'
      AND NOT EXISTS (
        SELECT 1 FROM projects p WHERE p.id = elem_text::bigint
      )
    UNION
    -- Find invalid string organization references
    SELECT DISTINCT 
      ge.project_id AS source_project_id,
      ge.grant->>'organization' AS target_project_id
    FROM grants_expanded ge
    WHERE ge.grant ? 'organization'
      AND jsonb_typeof(ge.grant->'organization') = 'string'
      AND ge.grant->>'organization' ~ '^\d+$'
      AND NOT EXISTS (
        SELECT 1 FROM projects p WHERE p.id = (ge.grant->>'organization')::bigint
      )
    UNION
    -- Find invalid donator references
    SELECT DISTINCT 
      ge.project_id AS source_project_id,
      elem_text AS target_project_id
    FROM grants_expanded ge,
         LATERAL jsonb_array_elements_text(ge.grant->'projectDonator') AS elem_text
    WHERE ge.grant ? 'projectDonator'
      AND jsonb_typeof(ge.grant->'projectDonator') = 'array'
      AND elem_text ~ '^\d+$'
      AND NOT EXISTS (
        SELECT 1 FROM projects p WHERE p.id = elem_text::bigint
      )
  )
  SELECT COUNT(*) INTO v_error_count FROM invalid_refs;
  
  IF v_error_count > 0 THEN
    RAISE WARNING 'Found % invalid project references that were skipped', v_error_count;
  END IF;
  
  -- Get statistics
  SELECT COUNT(*) INTO v_total_relations FROM project_relations;
  SELECT COUNT(*) INTO v_org_count FROM project_relations WHERE relation_type = 'organization';
  SELECT COUNT(*) INTO v_donator_count FROM project_relations WHERE relation_type = 'donator';
  SELECT COUNT(*) INTO v_active_count FROM project_relations WHERE is_active = true;
  
  RAISE NOTICE '=== Migration Results ===';
  RAISE NOTICE 'Processed % projects', v_project_count;
  RAISE NOTICE 'Created % new relations', v_count;
  RAISE NOTICE 'Skipped % invalid references', v_error_count;
  RAISE NOTICE '';
  RAISE NOTICE '=== Total Statistics ===';
  RAISE NOTICE 'Total relations: %', v_total_relations;
  RAISE NOTICE 'Organization relations: %', v_org_count;
  RAISE NOTICE 'Donator relations: %', v_donator_count;
  RAISE NOTICE 'Active relations: %', v_active_count;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Migration failed: %', SQLERRM;
    RAISE;
END $$;

-- Verify for duplicate active relations
DO $$
DECLARE
  v_duplicates INTEGER;
BEGIN
  WITH duplicates AS (
    SELECT source_project_id, target_project_id, relation_type, COUNT(*)
    FROM project_relations
    WHERE is_active = true
    GROUP BY source_project_id, target_project_id, relation_type
    HAVING COUNT(*) > 1
  )
  SELECT COUNT(*) INTO v_duplicates FROM duplicates;
  
  IF v_duplicates > 0 THEN
    RAISE WARNING 'Found % duplicate active relations!', v_duplicates;
  ELSE
    RAISE NOTICE 'No duplicate active relations found ✓';
  END IF;
END $$;