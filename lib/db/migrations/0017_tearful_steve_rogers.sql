ALTER TABLE "project_logs" ADD COLUMN "item_proposal_id" bigint;--> statement-breakpoint
ALTER TABLE "project_logs" ADD COLUMN "item" text;--> statement-breakpoint
ALTER TABLE "project_logs" ADD CONSTRAINT "project_logs_item_proposal_id_item_proposals_id_fk" FOREIGN KEY ("item_proposal_id") REFERENCES "public"."item_proposals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_logs" DROP COLUMN "items";