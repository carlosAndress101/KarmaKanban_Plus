ALTER TABLE "members" ADD COLUMN "gamification_role" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "points" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "selected_icons" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "about_me" text;