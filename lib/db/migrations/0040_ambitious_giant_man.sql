CREATE TABLE "project_snaps" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"project_id" bigint NOT NULL,
	"items" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_snaps" ADD CONSTRAINT "project_snaps_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_snaps_project_id_idx" ON "project_snaps" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_snaps_created_at_idx" ON "project_snaps" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "project_snaps_project_id_created_at_idx" ON "project_snaps" USING btree ("project_id","created_at" DESC NULLS LAST);