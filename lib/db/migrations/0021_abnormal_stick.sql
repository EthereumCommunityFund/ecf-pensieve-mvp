ALTER TABLE "vote_records" ADD COLUMN "project_id" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "vote_records" ADD CONSTRAINT "vote_records_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_logs_project_id_key_idx" ON "project_logs" USING btree ("project_id","key");--> statement-breakpoint
CREATE INDEX "project_logs_created_at_idx" ON "project_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "project_logs_project_id_idx" ON "project_logs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_logs_key_idx" ON "project_logs" USING btree ("key");--> statement-breakpoint
CREATE INDEX "project_logs_project_id_key_created_at_idx" ON "project_logs" USING btree ("project_id","key","created_at");