-- Migrate historical ecosystem relations data (FIXED VERSION - NO TRANSACTION CONTROL)
-- This script addresses critical issues: index conflicts, transaction safety, and data validation
-- Fixed issues: unique index conflicts, bigint overflow protection, transaction safety, logic consistency
-- NOTE: Transaction control removed for Drizzle ORM compatibility

-- Log migration start
DO $$
BEGIN
    RAISE NOTICE 'Starting ecosystem relations migration at: %', CURRENT_TIMESTAMP;
END $$;

-- Clear potential conflicts before migration
-- Remove inactive records that would conflict with new active records
-- This addresses the unique index conflict issue
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH potential_conflicts AS (
        SELECT DISTINCT ON (pl.project_id, pl.key)
            pl.project_id AS source_id,
            CASE pl.key
                WHEN 'affiliated_projects' THEN 'affiliated'
                WHEN 'contributing_teams' THEN 'contributing_team'
                WHEN 'stack_integrations' THEN 'stack_integration'
            END AS relation_type
        FROM project_logs pl
        JOIN item_proposals ip ON ip.id = pl.item_proposal_id
        WHERE pl.key IN ('affiliated_projects','contributing_teams','stack_integrations')
            AND pl.is_not_leading = false
            AND ip.value IS NOT NULL
            AND jsonb_typeof(ip.value) = 'array'
        ORDER BY pl.project_id, pl.key, pl.created_at DESC
    )
    DELETE FROM project_relations pr
    WHERE pr.is_active = FALSE 
    AND EXISTS (
        SELECT 1 FROM potential_conflicts pc
        WHERE pc.source_id = pr.source_project_id 
        AND pc.relation_type = pr.relation_type
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Cleaned up % conflicting inactive records', deleted_count;
END $$;

-- Main migration logic with enhanced safety checks
WITH latest_logs AS (
    SELECT DISTINCT ON (pl.project_id, pl.key)
        pl.id AS log_id,
        pl.project_id,
        pl.item_proposal_id,
        pl.key,
        pl.created_at,
        ip.value
    FROM project_logs pl
    JOIN item_proposals ip ON ip.id = pl.item_proposal_id
    WHERE pl.key IN ('affiliated_projects','contributing_teams','stack_integrations')
        AND pl.is_not_leading = false
        AND ip.value IS NOT NULL
        AND jsonb_typeof(ip.value) = 'array'
    ORDER BY pl.project_id, pl.key, pl.created_at DESC
),
expanded AS (
    SELECT
        l.project_id AS source_id,
        l.log_id,
        l.item_proposal_id,
        l.key,
        array_elem.value AS item
    FROM latest_logs l,
    LATERAL jsonb_array_elements(l.value) AS array_elem(value)
),
ids_from_array AS (
    SELECT
        e.source_id,
        e.log_id,
        e.item_proposal_id,
        e.key,
        jsonb_array_elements_text(e.item->'project') AS id_text
    FROM expanded e
    WHERE e.item ? 'project'
        AND jsonb_typeof(e.item->'project') = 'array'
),
ids_from_string AS (
    SELECT
        e.source_id,
        e.log_id,
        e.item_proposal_id,
        e.key,
        (e.item->>'project') AS id_text
    FROM expanded e
    WHERE e.item ? 'project'
        AND jsonb_typeof(e.item->'project') = 'string'
),
all_ids AS (
    SELECT * FROM ids_from_array
    UNION ALL
    SELECT * FROM ids_from_string
),
-- Enhanced validation with bigint overflow protection
valid_ids AS (
    SELECT DISTINCT source_id, log_id, item_proposal_id, key, id_text
    FROM all_ids
    WHERE id_text ~ '^\d+$'
        AND LENGTH(id_text) <= 18  -- Prevent bigint overflow
        AND id_text::numeric <= 9223372036854775807  -- Explicit range check
),
-- Add target project existence validation
ready AS (
    SELECT
        vi.source_id,
        vi.id_text::bigint AS target_id,
        CASE vi.key
            WHEN 'affiliated_projects' THEN 'affiliated'
            WHEN 'contributing_teams' THEN 'contributing_team'
            WHEN 'stack_integrations' THEN 'stack_integration'
        END AS relation_type,
        vi.item_proposal_id,
        vi.log_id
    FROM valid_ids vi
    -- Validate that target project exists to prevent foreign key violations
    WHERE EXISTS (SELECT 1 FROM projects p WHERE p.id = vi.id_text::bigint)
),
-- Mimic trigger behavior: deactivate existing relations first
deactivate_existing AS (
    UPDATE project_relations pr
    SET is_active = FALSE
    WHERE (pr.source_project_id, pr.relation_type) IN (
        SELECT DISTINCT source_id, relation_type FROM ready
    )
    AND pr.is_active = TRUE
    RETURNING pr.id AS deactivated_id
)
INSERT INTO project_relations (
    source_project_id, target_project_id, relation_type,
    item_proposal_id, project_log_id, is_active
)
SELECT
    r.source_id, r.target_id, r.relation_type,
    r.item_proposal_id, r.log_id, TRUE
FROM ready r
ON CONFLICT (source_project_id, target_project_id, relation_type) 
DO UPDATE SET 
    is_active = TRUE,
    item_proposal_id = EXCLUDED.item_proposal_id,
    project_log_id = EXCLUDED.project_log_id;

-- Migration verification and logging
DO $$
DECLARE
    migration_results RECORD;
    duplicate_check RECORD;
    has_duplicates BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE 'Migration completed. Results:';
    
    -- Show migration results by relation type
    FOR migration_results IN 
        SELECT 
            relation_type, 
            COUNT(*) AS total_relations,
            COUNT(*) FILTER (WHERE is_active = true) AS active_relations
        FROM project_relations
        WHERE relation_type IN ('affiliated','contributing_team','stack_integration')
        GROUP BY relation_type
        ORDER BY relation_type
    LOOP
        RAISE NOTICE 'Relation type: %, Total: %, Active: %', 
            migration_results.relation_type, 
            migration_results.total_relations,
            migration_results.active_relations;
    END LOOP;
    
    -- Check for any duplicate active relations (should be none)
    RAISE NOTICE 'Checking for duplicate active relations:';
    FOR duplicate_check IN
        SELECT 
            source_project_id, target_project_id, relation_type, COUNT(*)
        FROM project_relations 
        WHERE is_active = true 
            AND relation_type IN ('affiliated','contributing_team','stack_integration')
        GROUP BY source_project_id, target_project_id, relation_type
        HAVING COUNT(*) > 1
    LOOP
        has_duplicates := TRUE;
        RAISE WARNING 'Found duplicate active relation: source=%, target=%, type=%, count=%',
            duplicate_check.source_project_id,
            duplicate_check.target_project_id,
            duplicate_check.relation_type,
            duplicate_check.count;
    END LOOP;
    
    IF NOT has_duplicates THEN
        RAISE NOTICE 'No duplicate active relations found - validation passed';
    ELSE
        RAISE EXCEPTION 'Migration validation failed due to duplicate active relations';
    END IF;
    
    RAISE NOTICE 'Migration completed successfully at: %', CURRENT_TIMESTAMP;
END $$;