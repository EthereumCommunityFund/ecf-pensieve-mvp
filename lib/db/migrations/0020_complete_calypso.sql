ALTER TABLE "project_logs" RENAME COLUMN "item" TO "key";--> statement-breakpoint
ALTER TABLE "vote_records" ALTER COLUMN "proposal_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vote_records" ADD COLUMN "item_proposal_id" bigint;--> statement-breakpoint
ALTER TABLE "vote_records" ADD CONSTRAINT "vote_records_item_proposal_id_item_proposals_id_fk" FOREIGN KEY ("item_proposal_id") REFERENCES "public"."item_proposals"("id") ON DELETE no action ON UPDATE no action;