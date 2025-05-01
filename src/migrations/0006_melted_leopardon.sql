ALTER TABLE "members" RENAME COLUMN "user_id" TO "id";--> statement-breakpoint
ALTER TABLE "members" DROP CONSTRAINT "members_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;