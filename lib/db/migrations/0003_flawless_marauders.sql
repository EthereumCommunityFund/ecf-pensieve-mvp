ALTER TABLE "proposals" RENAME COLUMN "user_id" TO "creator";--> statement-breakpoint
ALTER TABLE "proposals" DROP CONSTRAINT "proposals_user_id_profiles_user_id_fk";
--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_creator_profiles_user_id_fk" FOREIGN KEY ("creator") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;