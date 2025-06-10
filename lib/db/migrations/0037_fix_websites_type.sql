ALTER TABLE "projects" ADD COLUMN "websites_temp" jsonb[];

UPDATE "projects" 
SET "websites_temp" = CASE 
  WHEN "websites" IS NOT NULL AND "websites" != '' THEN
    ARRAY[json_build_object('title', 'Main Website', 'url', "websites")::jsonb]
  ELSE
    ARRAY[]::jsonb[]
END;

ALTER TABLE "projects" DROP COLUMN "websites";
ALTER TABLE "projects" RENAME COLUMN "websites_temp" TO "websites";

ALTER TABLE "projects" ALTER COLUMN "websites" SET NOT NULL; 