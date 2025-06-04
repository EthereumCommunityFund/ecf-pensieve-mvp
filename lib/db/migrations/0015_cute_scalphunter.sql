ALTER TABLE "projects" ADD COLUMN "tags" text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "white_paper" text NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "dapp_smart_contracts" text NOT NULL;