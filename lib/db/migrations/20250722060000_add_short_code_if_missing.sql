-- Fix: Ensure short_code column exists in projects table
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "short_code" text;
-- Ensure unique constraint exists (will fail silently if already exists)
DO $$
BEGIN
    ALTER TABLE "projects" ADD CONSTRAINT "projects_short_code_unique" UNIQUE("short_code");
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;