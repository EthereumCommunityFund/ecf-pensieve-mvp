-- Fix: Add missing categories column to project_snaps table before creating index
ALTER TABLE "project_snaps" ADD COLUMN IF NOT EXISTS "categories" text[];