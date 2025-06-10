CREATE TABLE "item_proposals" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"item" text NOT NULL,
	"ref" text NOT NULL,
	"project_id" bigint NOT NULL,
	"creator" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "item_proposals" ADD CONSTRAINT "item_proposals_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_proposals" ADD CONSTRAINT "item_proposals_creator_profiles_user_id_fk" FOREIGN KEY ("creator") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "item_proposals_project_id_idx" ON "item_proposals" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "item_proposals_creator_idx" ON "item_proposals" USING btree ("creator");--> statement-breakpoint
CREATE INDEX "item_proposals_item_idx" ON "item_proposals" USING btree ("item");