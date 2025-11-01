CREATE TABLE "user_action_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_action_logs" ADD CONSTRAINT "user_action_logs_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;