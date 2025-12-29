CREATE TABLE "project_discussion_answers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"thread_id" bigint NOT NULL,
	"creator" uuid NOT NULL,
	"content" text NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"vote_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_discussion_answer_votes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"answer_id" bigint NOT NULL,
	"voter" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_discussion_comments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"thread_id" bigint,
	"answer_id" bigint,
	"parent_comment_id" bigint,
	"root_comment_id" bigint,
	"creator" uuid NOT NULL,
	"content" text NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "project_discussion_sentiments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"thread_id" bigint,
	"answer_id" bigint,
	"creator" uuid NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_discussion_answers" ADD CONSTRAINT "project_discussion_answers_thread_id_project_discussion_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."project_discussion_threads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_discussion_answers" ADD CONSTRAINT "project_discussion_answers_creator_profiles_user_id_fk" FOREIGN KEY ("creator") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_discussion_answer_votes" ADD CONSTRAINT "project_discussion_answer_votes_answer_id_project_discussion_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."project_discussion_answers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_discussion_answer_votes" ADD CONSTRAINT "project_discussion_answer_votes_voter_profiles_user_id_fk" FOREIGN KEY ("voter") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_discussion_comments" ADD CONSTRAINT "project_discussion_comments_thread_id_project_discussion_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."project_discussion_threads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_discussion_comments" ADD CONSTRAINT "project_discussion_comments_answer_id_project_discussion_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."project_discussion_answers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_discussion_comments" ADD CONSTRAINT "project_discussion_comments_creator_profiles_user_id_fk" FOREIGN KEY ("creator") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_discussion_comments" ADD CONSTRAINT "project_discussion_comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."project_discussion_comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_discussion_comments" ADD CONSTRAINT "project_discussion_comments_comment_id_fkey" FOREIGN KEY ("root_comment_id") REFERENCES "public"."project_discussion_comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_discussion_sentiments" ADD CONSTRAINT "project_discussion_sentiments_thread_id_project_discussion_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."project_discussion_threads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_discussion_sentiments" ADD CONSTRAINT "project_discussion_sentiments_answer_id_project_discussion_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."project_discussion_answers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_discussion_sentiments" ADD CONSTRAINT "project_discussion_sentiments_creator_profiles_user_id_fk" FOREIGN KEY ("creator") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_discussion_answers_thread_created_at_idx" ON "project_discussion_answers" USING btree ("thread_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "project_discussion_answer_votes_answer_id_idx" ON "project_discussion_answer_votes" USING btree ("answer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_discussion_answer_votes_answer_id_voter_idx" ON "project_discussion_answer_votes" USING btree ("answer_id","voter");--> statement-breakpoint
CREATE INDEX "project_discussion_sentiments_thread_id_idx" ON "project_discussion_sentiments" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "project_discussion_sentiments_answer_id_idx" ON "project_discussion_sentiments" USING btree ("answer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_discussion_sentiments_thread_creator_idx" ON "project_discussion_sentiments" USING btree ("thread_id","creator");--> statement-breakpoint
CREATE UNIQUE INDEX "project_discussion_sentiments_answer_creator_idx" ON "project_discussion_sentiments" USING btree ("answer_id","creator");