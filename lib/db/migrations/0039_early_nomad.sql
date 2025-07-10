ALTER TABLE "notifications" ADD COLUMN "voter_id" uuid;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_voter_id_profiles_user_id_fk" FOREIGN KEY ("voter_id") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;