ALTER TABLE "item_proposals" RENAME COLUMN "item" TO "key";--> statement-breakpoint
DROP INDEX "item_proposals_item_idx";--> statement-breakpoint
ALTER TABLE "item_proposals" ADD COLUMN "value" jsonb;--> statement-breakpoint
CREATE INDEX "item_proposals_key_idx" ON "item_proposals" USING btree ("key");