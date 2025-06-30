CREATE TABLE "ranks" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"project_id" bigserial NOT NULL,
	"published_genesis_weight" double precision DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ranks" ADD CONSTRAINT "ranks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ranks_project_id_idx" ON "ranks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "ranks_published_genesis_weight_idx" ON "ranks" USING btree ("published_genesis_weight" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "ranks_ranking_idx" ON "ranks" USING btree ("published_genesis_weight" DESC NULLS LAST,"project_id");--> statement-breakpoint
CREATE INDEX "like_records_project_id_creator_idx" ON "like_records" USING btree ("project_id","creator");