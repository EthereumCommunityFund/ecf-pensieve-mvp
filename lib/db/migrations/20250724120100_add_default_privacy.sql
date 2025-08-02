-- Add 'default' as a valid value for privacy column in lists table
ALTER TABLE "lists" DROP CONSTRAINT IF EXISTS "lists_privacy_check";

-- PostgreSQL doesn't have ALTER TYPE for text columns with check constraints
-- So we need to update the column definition directly
ALTER TABLE "lists" 
ALTER COLUMN "privacy" TYPE text;

-- Add the new check constraint with 'default' included
ALTER TABLE "lists" 
ADD CONSTRAINT "lists_privacy_check" 
CHECK ("privacy" IN ('private', 'public', 'default'));

-- Update existing "Bookmarked Projects (Default)" lists to use privacy='default'
UPDATE "lists" 
SET "privacy" = 'default' 
WHERE "name" = 'Bookmarked Projects (Default)' 
  AND "privacy" = 'private';