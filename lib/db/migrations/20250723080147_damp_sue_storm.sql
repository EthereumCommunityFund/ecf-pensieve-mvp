CREATE TABLE "list_follows" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"list_id" bigint NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "list_follows_list_id_user_id_unique" UNIQUE("list_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "list_projects" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"list_id" bigint NOT NULL,
	"project_id" bigint NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	"added_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "list_projects_list_id_project_id_unique" UNIQUE("list_id","project_id")
);
--> statement-breakpoint
CREATE TABLE "lists" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"privacy" text NOT NULL,
	"creator" uuid NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"follow_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "lists_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "list_follows" ADD CONSTRAINT "list_follows_list_id_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_follows" ADD CONSTRAINT "list_follows_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_projects" ADD CONSTRAINT "list_projects_list_id_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_projects" ADD CONSTRAINT "list_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_projects" ADD CONSTRAINT "list_projects_added_by_profiles_user_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lists" ADD CONSTRAINT "lists_creator_profiles_user_id_fk" FOREIGN KEY ("creator") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "list_follows_list_id_idx" ON "list_follows" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX "list_follows_user_id_idx" ON "list_follows" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "list_projects_list_id_idx" ON "list_projects" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX "list_projects_project_id_idx" ON "list_projects" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "lists_creator_idx" ON "lists" USING btree ("creator");--> statement-breakpoint
CREATE INDEX "lists_privacy_idx" ON "lists" USING btree ("privacy");--> statement-breakpoint
CREATE INDEX "lists_slug_idx" ON "lists" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "lists_created_at_idx" ON "lists" USING btree ("created_at" DESC NULLS LAST);