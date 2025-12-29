DROP INDEX "project_discussion_answer_votes_answer_id_voter_idx";--> statement-breakpoint
ALTER TABLE "project_discussion_answer_votes" ADD COLUMN "weight" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "project_discussion_answer_votes" ADD COLUMN "thread_id" bigint;--> statement-breakpoint
ALTER TABLE "project_discussion_answer_votes" ADD CONSTRAINT "project_discussion_answer_votes_thread_id_project_discussion_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."project_discussion_threads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_discussion_answer_votes_thread_id_idx" ON "project_discussion_answer_votes" USING btree ("thread_id","voter");