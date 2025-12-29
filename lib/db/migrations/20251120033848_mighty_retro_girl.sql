CREATE TABLE "project_discussion_threads" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"project_id" bigint NOT NULL,
	"creator" uuid NOT NULL,
	"title" text NOT NULL,
	"post" text NOT NULL,
	"category" text[] DEFAULT '{}' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"is_scam" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_discussion_threads" ADD CONSTRAINT "project_discussion_threads_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_discussion_threads" ADD CONSTRAINT "project_discussion_threads_creator_profiles_user_id_fk" FOREIGN KEY ("creator") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_discussion_threads_project_created_at_idx" ON "project_discussion_threads" USING btree ("project_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "project_discussion_threads_category_gin_idx" ON "project_discussion_threads" USING gin ("category");--> statement-breakpoint
CREATE INDEX "project_discussion_threads_tags_gin_idx" ON "project_discussion_threads" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "project_discussion_threads_project_scam_idx" ON "project_discussion_threads" USING btree ("project_id","is_scam");