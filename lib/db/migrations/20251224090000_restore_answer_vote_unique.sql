CREATE UNIQUE INDEX "project_discussion_answer_votes_answer_id_voter_idx" ON "project_discussion_answer_votes" USING btree ("answer_id","voter");--> statement-breakpoint
