ALTER TABLE "project_discussion_answers" ADD COLUMN "support" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "project_discussion_answers" DROP COLUMN "vote_count";