CREATE INDEX "project_snaps_categories_idx" ON "project_snaps" USING btree ("categories");--> statement-breakpoint
CREATE OR REPLACE FUNCTION update_project_snap_categories()
RETURNS TRIGGER AS $$
DECLARE
  item jsonb;
BEGIN
  NEW.categories := NULL;

  FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
  LOOP
    IF item->>'key' = 'categories' THEN
      NEW.categories := ARRAY(SELECT jsonb_array_elements_text(item->'value'));
      EXIT;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER trg_update_project_snap_categories
BEFORE INSERT OR UPDATE ON project_snaps
FOR EACH ROW
EXECUTE FUNCTION update_project_snap_categories();