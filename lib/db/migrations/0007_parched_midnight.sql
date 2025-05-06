CREATE INDEX "active_logs_user_id_idx" ON "active_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "active_logs_created_at_idx" ON "active_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "active_logs_project_id_idx" ON "active_logs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "active_logs_user_created_at_idx" ON "active_logs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "projects_creator_idx" ON "projects" USING btree ("creator");--> statement-breakpoint
CREATE INDEX "projects_is_published_idx" ON "projects" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "proposals_project_id_idx" ON "proposals" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "proposals_creator_idx" ON "proposals" USING btree ("creator");--> statement-breakpoint
CREATE INDEX "vote_records_proposal_id_idx" ON "vote_records" USING btree ("proposal_id");--> statement-breakpoint
CREATE INDEX "vote_records_creator_idx" ON "vote_records" USING btree ("creator");--> statement-breakpoint
CREATE INDEX "vote_records_key_idx" ON "vote_records" USING btree ("key");--> statement-breakpoint
CREATE INDEX "vote_records_creator_key_idx" ON "vote_records" USING btree ("creator","key");--> statement-breakpoint
CREATE INDEX "vote_records_creator_proposal_key_idx" ON "vote_records" USING btree ("creator","proposal_id","key");