ALTER TABLE "projects" ADD COLUMN "short_code" text;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_short_code_unique" UNIQUE("short_code");