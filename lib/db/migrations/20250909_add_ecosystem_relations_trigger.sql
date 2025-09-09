-- Add indexes for ecosystem relations queries
CREATE INDEX IF NOT EXISTS pr_source_active_type_idx
ON project_relations (source_project_id, relation_type)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS pr_target_active_type_idx
ON project_relations (target_project_id, relation_type)
WHERE is_active = true;

-- Create function to handle ecosystem relations
CREATE OR REPLACE FUNCTION handle_ecosystem_relations()
RETURNS TRIGGER AS $$
DECLARE
  v_value JSONB;
  v_relation_type TEXT;
BEGIN
  -- Only process ecosystem relation keys
  IF NEW.key NOT IN ('affiliated_projects','contributing_teams','stack_integrations') THEN
    RETURN NEW;
  END IF;

  -- Map key to relation type
  v_relation_type := CASE NEW.key
    WHEN 'affiliated_projects' THEN 'affiliated'
    WHEN 'contributing_teams' THEN 'contributing_team'
    WHEN 'stack_integrations' THEN 'stack_integration'
  END;

  -- Read proposal JSON value
  SELECT ip.value INTO v_value
  FROM item_proposals ip
  WHERE ip.id = NEW.item_proposal_id;

  -- Skip if not array
  IF v_value IS NULL OR jsonb_typeof(v_value) <> 'array' THEN
    RETURN NEW;
  END IF;

  -- Deactivate old relations of this type for the project
  UPDATE project_relations pr
     SET is_active = FALSE
   WHERE pr.source_project_id = NEW.project_id
     AND pr.relation_type = v_relation_type
     AND pr.is_active = TRUE;

  -- Parse project field (supports string | string[])
  WITH items AS (
    SELECT elem AS item
    FROM jsonb_array_elements(v_value) AS elem
  ),
  ids_from_array AS (
    SELECT jsonb_array_elements_text(item->'project') AS id_text
    FROM items
    WHERE item ? 'project'
      AND jsonb_typeof(item->'project') = 'array'
  ),
  ids_from_string AS (
    SELECT (item->>'project') AS id_text
    FROM items
    WHERE item ? 'project'
      AND jsonb_typeof(item->'project') = 'string'
  ),
  ids AS (
    SELECT DISTINCT id_text
    FROM (
      SELECT * FROM ids_from_array
      UNION ALL
      SELECT * FROM ids_from_string
    ) u
    WHERE id_text ~ '^\d+$'  -- Only accept numeric IDs
  )
  INSERT INTO project_relations (
    source_project_id, target_project_id, relation_type,
    item_proposal_id, project_log_id, is_active
  )
  SELECT
    NEW.project_id::bigint,
    id_text::bigint,
    v_relation_type,
    NEW.item_proposal_id,
    NEW.id,
    TRUE
  FROM ids
  ON CONFLICT (source_project_id, target_project_id, relation_type) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (only on INSERT)
DROP TRIGGER IF EXISTS ecosystem_relations_trigger ON project_logs;
CREATE TRIGGER ecosystem_relations_trigger
  AFTER INSERT ON project_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_ecosystem_relations();