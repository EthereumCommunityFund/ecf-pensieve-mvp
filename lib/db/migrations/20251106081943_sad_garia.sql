CREATE TABLE "sieve_follows" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"sieve_id" bigint NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sieve_follows_sieve_id_user_id_unique" UNIQUE("sieve_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "sieves" ADD COLUMN "follow_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "sieves" ADD COLUMN "filter_conditions" jsonb;--> statement-breakpoint
ALTER TABLE "sieve_follows" ADD CONSTRAINT "sieve_follows_sieve_id_sieves_id_fk" FOREIGN KEY ("sieve_id") REFERENCES "public"."sieves"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sieve_follows" ADD CONSTRAINT "sieve_follows_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sieve_follows_sieve_id_idx" ON "sieve_follows" USING btree ("sieve_id");--> statement-breakpoint
CREATE INDEX "sieve_follows_user_id_idx" ON "sieve_follows" USING btree ("user_id");