import { UserRole } from "@/lib/schemas_drizzle";

export type Member =  {
  workspaceId: string;
  userId: string;
  role:  UserRole;
};