CREATE INDEX "item_proposals_project_id_key_idx" ON "item_proposals" USING btree ("project_id","key");--> statement-breakpoint
CREATE INDEX "vote_records_creator_project_key_null_proposal_idx" ON "vote_records" USING btree ("creator","project_id","key");--> statement-breakpoint
CREATE INDEX "vote_records_item_proposal_key_idx" ON "vote_records" USING btree ("item_proposal_id","key");