CREATE TABLE "invitation_codes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" uuid DEFAULT gen_random_uuid() NOT NULL,
	"max_uses" integer DEFAULT 3 NOT NULL,
	"current_uses" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitation_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "weight" double precision;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "invitation_code_id" bigint;--> statement-breakpoint
ALTER TABLE "vote_records" ADD COLUMN "weight" double precision;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_invitation_code_id_invitation_codes_id_fk" FOREIGN KEY ("invitation_code_id") REFERENCES "public"."invitation_codes"("id") ON DELETE no action ON UPDATE no action;