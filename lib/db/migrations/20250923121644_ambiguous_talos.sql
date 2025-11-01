CREATE TABLE "share_links" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"parent_id" text,
	"target_url" text NOT NULL,
	"visibility" text DEFAULT 'public' NOT NULL,
	"og_snapshot" jsonb,
	"channel_overrides" jsonb,
	"stats" jsonb,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	CONSTRAINT "share_links_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_created_by_profiles_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "share_links_entity_type_idx" ON "share_links" USING btree ("entity_type");--> statement-breakpoint
CREATE UNIQUE INDEX "share_links_entity_unique_idx" ON "share_links" USING btree ("entity_type","entity_id");
