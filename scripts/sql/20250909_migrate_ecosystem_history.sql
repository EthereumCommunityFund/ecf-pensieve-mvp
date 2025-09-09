-- Migrate historical ecosystem relations data
-- This script parses existing item_proposals for ecosystem keys and creates project_relations records

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
    elem AS item
  FROM latest_logs l,
  LATERAL jsonb_array_elements(l.value) AS elem
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
valid_ids AS (
  SELECT DISTINCT source_id, log_id, item_proposal_id, key, id_text
  FROM all_ids
  WHERE id_text ~ '^\d+$'
),
ready AS (
  SELECT
    source_id,
    id_text::bigint AS target_id,
    CASE key
      WHEN 'affiliated_projects' THEN 'affiliated'
      WHEN 'contributing_teams' THEN 'contributing_team'
      WHEN 'stack_integrations' THEN 'stack_integration'
    END AS relation_type,
    item_proposal_id,
    log_id
  FROM valid_ids
)
INSERT INTO project_relations (
  source_project_id, target_project_id, relation_type,
  item_proposal_id, project_log_id, is_active
)
SELECT
  source_id, target_id, relation_type,
  item_proposal_id, log_id, TRUE
FROM ready
ON CONFLICT (source_project_id, target_project_id, relation_type) DO NOTHING;

-- Show migration results
SELECT relation_type, COUNT(*) AS total
FROM project_relations
WHERE relation_type IN ('affiliated','contributing_team','stack_integration')
GROUP BY relation_type;