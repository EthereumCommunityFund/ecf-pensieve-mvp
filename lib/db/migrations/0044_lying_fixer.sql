DROP INDEX "projects_categories_gin_idx";--> statement-breakpoint
DROP INDEX "project_snaps_categories_idx";--> statement-breakpoint
CREATE INDEX "project_snaps_categories_gin_idx" ON "project_snaps" USING gin ("categories");