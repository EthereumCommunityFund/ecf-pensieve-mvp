CREATE TABLE "project_discussion_votes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"thread_id" bigint NOT NULL,
	"voter" uuid NOT NULL,
	"weight" double precision DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_discussion_threads" ADD COLUMN "support" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "project_discussion_votes" ADD CONSTRAINT "project_discussion_votes_thread_id_project_discussion_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."project_discussion_threads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_discussion_votes" ADD CONSTRAINT "project_discussion_votes_voter_profiles_user_id_fk" FOREIGN KEY ("voter") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_discussion_votes_thread_id_idx" ON "project_discussion_votes" USING btree ("thread_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_discussion_votes_thread_id_voter_idx" ON "project_discussion_votes" USING btree ("thread_id","voter");--> statement-breakpoint
CREATE INDEX "project_discussion_threads_project_support_idx" ON "project_discussion_threads" USING btree ("project_id","support" DESC NULLS LAST);