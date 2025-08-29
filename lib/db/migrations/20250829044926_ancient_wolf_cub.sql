CREATE TABLE "project_relations" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"source_project_id" bigint NOT NULL,
	"target_project_id" bigint NOT NULL,
	"relation_type" text NOT NULL,
	"item_proposal_id" bigint,
	"project_log_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_relations" ADD CONSTRAINT "project_relations_source_project_id_projects_id_fk" FOREIGN KEY ("source_project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_relations" ADD CONSTRAINT "project_relations_target_project_id_projects_id_fk" FOREIGN KEY ("target_project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_relations" ADD CONSTRAINT "project_relations_item_proposal_id_item_proposals_id_fk" FOREIGN KEY ("item_proposal_id") REFERENCES "public"."item_proposals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_relations" ADD CONSTRAINT "project_relations_project_log_id_project_logs_id_fk" FOREIGN KEY ("project_log_id") REFERENCES "public"."project_logs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pr_source_active_idx" ON "project_relations" USING btree ("source_project_id","is_active");--> statement-breakpoint
CREATE INDEX "pr_target_active_idx" ON "project_relations" USING btree ("target_project_id","is_active");--> statement-breakpoint
CREATE INDEX "pr_project_log_idx" ON "project_relations" USING btree ("project_log_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pr_unique_relation_idx" ON "project_relations" USING btree ("source_project_id","target_project_id","relation_type");

-- Create function to handle funding relations when new leading proposals are created
CREATE OR REPLACE FUNCTION handle_funding_relations()
RETURNS TRIGGER AS $$
DECLARE
  v_value JSONB;  -- 直接拿 item_proposals.value
BEGIN
  -- 仅处理 funding_received_grants
  IF NEW.key <> 'funding_received_grants' THEN
    RETURN NEW;
  END IF;

  -- 读取 JSON value
  SELECT ip.value INTO v_value
  FROM item_proposals ip
  WHERE ip.id = NEW.item_proposal_id;

  -- 无数据或不是数组则跳过
  IF v_value IS NULL OR jsonb_typeof(v_value) <> 'array' THEN
    RETURN NEW;
  END IF;

  -- 可选：对同一项目加事务级互斥，避免并发覆盖（如需再打开）
  -- PERFORM pg_advisory_xact_lock(NEW.project_id);

  -- 先停用本项目旧的资助类关系（不影响其他 relation_type）
  UPDATE project_relations pr
     SET is_active = FALSE
   WHERE pr.source_project_id = NEW.project_id
     AND pr.relation_type IN ('organization','donator')
     AND pr.is_active = TRUE;

  -- 集合化解析并插入两类关系
  WITH grants AS (
    SELECT elem AS grant
    FROM jsonb_array_elements(v_value) AS elem
  ),
  org_ids AS (  -- organization：数组字符串 -> 去重 -> 仅数字
    SELECT DISTINCT id_text
    FROM grants g,
         LATERAL jsonb_array_elements_text(g.grant->'organization') AS id_text
    WHERE g.grant ? 'organization'
      AND jsonb_typeof(g.grant->'organization') = 'array'
      AND id_text ~ '^\d+$'
  ),
  don_ids AS (  -- projectDonator：数组字符串 -> 去重 -> 仅数字
    SELECT DISTINCT id_text
    FROM grants g,
         LATERAL jsonb_array_elements_text(g.grant->'projectDonator') AS id_text
    WHERE g.grant ? 'projectDonator'
      AND jsonb_typeof(g.grant->'projectDonator') = 'array'
      AND id_text ~ '^\d+$'
  ),
  to_insert AS (
    SELECT NEW.project_id::bigint AS source_project_id,
           id_text::bigint        AS target_project_id,
           'organization'         AS relation_type
    FROM org_ids
    UNION ALL
    SELECT NEW.project_id::bigint,
           id_text::bigint,
           'donator'
    FROM don_ids
  )
  INSERT INTO project_relations (
    source_project_id, target_project_id, relation_type,
    item_proposal_id, project_log_id, is_active
  )
  SELECT
    ti.source_project_id, ti.target_project_id, ti.relation_type,
    NEW.item_proposal_id, NEW.id, TRUE
  FROM to_insert ti
  ON CONFLICT (source_project_id, target_project_id, relation_type) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (only on INSERT)
DROP TRIGGER IF EXISTS funding_relations_trigger ON project_logs;
CREATE TRIGGER funding_relations_trigger
  AFTER INSERT ON project_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_funding_relations();

-- Add unique constraint index to prevent duplicate active relations
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_relation 
ON project_relations(source_project_id, target_project_id, relation_type) 
WHERE is_active = true;