CREATE TABLE "login_nonces" (
	"address" text PRIMARY KEY NOT NULL,
	"nonce" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"avatar_url" text,
	"address" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"tagline" text NOT NULL,
	"categories" text[] NOT NULL,
	"main_description" text NOT NULL,
	"logo_url" text NOT NULL,
	"website_url" text NOT NULL,
	"app_url" text,
	"date_founded" timestamp NOT NULL,
	"date_launch" timestamp,
	"dev_status" text NOT NULL,
	"funding_status" text,
	"open_source" boolean NOT NULL,
	"code_repo" text,
	"token_contract" text,
	"org_structure" text NOT NULL,
	"public_goods" boolean NOT NULL,
	"founders" jsonb[] NOT NULL,
	"creator" uuid NOT NULL,
	"refs" jsonb[]
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_creator_profiles_user_id_fk" FOREIGN KEY ("creator") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;