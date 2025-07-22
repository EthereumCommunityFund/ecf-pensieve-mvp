ALTER TABLE "project_snaps" ADD COLUMN "categories" text[];--> statement-breakpoint
CREATE INDEX "project_snaps_categories_gin_idx" ON "project_snaps" USING gin ("categories");