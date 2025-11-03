CREATE TABLE "sieves" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"target_path" text NOT NULL,
	"visibility" text DEFAULT 'public' NOT NULL,
	"creator" uuid NOT NULL,
	"share_link_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sieves" ADD CONSTRAINT "sieves_creator_profiles_user_id_fk" FOREIGN KEY ("creator") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sieves" ADD CONSTRAINT "sieves_share_link_id_share_links_id_fk" FOREIGN KEY ("share_link_id") REFERENCES "public"."share_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sieves_creator_idx" ON "sieves" USING btree ("creator");--> statement-breakpoint
CREATE UNIQUE INDEX "sieves_share_link_idx" ON "sieves" USING btree ("share_link_id");--> statement-breakpoint
CREATE INDEX "sieves_created_at_idx" ON "sieves" USING btree ("created_at" DESC NULLS LAST);