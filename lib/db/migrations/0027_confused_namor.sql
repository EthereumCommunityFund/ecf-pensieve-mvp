CREATE TABLE "like_records" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"project_id" bigint,
	"creator" uuid NOT NULL,
	"weight" double precision
);
--> statement-breakpoint
DROP INDEX "notifications_user_id_idx";--> statement-breakpoint
DROP INDEX "notifications_read_at_idx";--> statement-breakpoint
DROP INDEX "notifications_user_id_read_at_idx";--> statement-breakpoint
DROP INDEX "notifications_created_at_idx";--> statement-breakpoint
DROP INDEX "notifications_type_created_at_idx";--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "support" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "like_records" ADD CONSTRAINT "like_records_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "like_records" ADD CONSTRAINT "like_records_creator_profiles_user_id_fk" FOREIGN KEY ("creator") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "like_records_project_id_idx" ON "like_records" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "like_records_creator_idx" ON "like_records" USING btree ("creator");--> statement-breakpoint
CREATE INDEX "projects_pagination_idx" ON "projects" USING btree ("is_published","id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at" DESC NULLS LAST);