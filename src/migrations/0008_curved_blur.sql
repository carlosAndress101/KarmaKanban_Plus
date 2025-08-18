CREATE TABLE "member_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"badge_id" text NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL
);
-- ALTER TABLE "projects" ADD COLUMN "project_manager_id" uuid; -- commented out to avoid duplicate column error
ALTER TABLE "member_badges" ADD CONSTRAINT "member_badges_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "projects" ADD CONSTRAINT "projects_project_manager_id_members_id_fk" FOREIGN KEY ("project_manager_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action; -- commented out to avoid duplicate constraint error