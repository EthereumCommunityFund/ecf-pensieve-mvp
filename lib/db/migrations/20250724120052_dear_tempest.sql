ALTER TABLE "list_follows" DROP CONSTRAINT "list_follows_user_id_profiles_user_id_fk";
--> statement-breakpoint
ALTER TABLE "list_projects" DROP CONSTRAINT "list_projects_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "list_projects" DROP CONSTRAINT "list_projects_added_by_profiles_user_id_fk";
--> statement-breakpoint
ALTER TABLE "lists" DROP CONSTRAINT "lists_creator_profiles_user_id_fk";
--> statement-breakpoint
ALTER TABLE "list_follows" ADD CONSTRAINT "list_follows_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_projects" ADD CONSTRAINT "list_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_projects" ADD CONSTRAINT "list_projects_added_by_profiles_user_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lists" ADD CONSTRAINT "lists_creator_profiles_user_id_fk" FOREIGN KEY ("creator") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_projects" DROP COLUMN "added_at";