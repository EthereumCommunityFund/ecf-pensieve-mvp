ALTER TABLE "project_snaps" ADD COLUMN "name" text;

CREATE OR REPLACE FUNCTION update_project_snap_name()
RETURNS TRIGGER AS $$
DECLARE
  item jsonb;
BEGIN
  NEW.name := NULL;

  FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
  LOOP
    IF item->>'key' = 'name' THEN
      NEW.name := item->>'value';
      EXIT;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_update_project_snap_name
BEFORE INSERT OR UPDATE ON project_snaps
FOR EACH ROW
EXECUTE FUNCTION update_project_snap_name();