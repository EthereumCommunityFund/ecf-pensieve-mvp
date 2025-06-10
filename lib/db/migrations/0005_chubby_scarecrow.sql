ALTER TABLE "vote_records" RENAME COLUMN "user_id" TO "creator";--> statement-breakpoint
ALTER TABLE "vote_records" DROP CONSTRAINT "vote_records_user_id_profiles_user_id_fk";
--> statement-breakpoint
ALTER TABLE "active_logs" ALTER COLUMN "target_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "vote_records" ADD CONSTRAINT "vote_records_creator_profiles_user_id_fk" FOREIGN KEY ("creator") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;