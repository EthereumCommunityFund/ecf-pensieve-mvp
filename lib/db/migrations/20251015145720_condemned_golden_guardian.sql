CREATE TYPE "public"."admin_whitelist_role" AS ENUM('super_admin', 'admin', 'extra');--> statement-breakpoint
CREATE TABLE "admin_whitelist" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"address" text NOT NULL,
	"nickname" text,
	"role" "admin_whitelist_role" DEFAULT 'admin' NOT NULL,
	"is_disabled" boolean DEFAULT false NOT NULL,
	CONSTRAINT "admin_whitelist_address_unique" UNIQUE("address")
);
