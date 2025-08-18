import { UserRole } from "@/lib/schemas_drizzle";

export type Member = {
  id: string;
  workspaceId: string;
  userId: string;
  role: UserRole;
  name: string;
  email: string;
  points: number | null;
  gamificationRole:
    | "Developer"
    | "Designer"
    | "Project Manager"
    | "Team Lead"
    | null;
  selectedIcons: string | null;
  aboutMe: string | null;
  earnedBadges?: string | null;
};
