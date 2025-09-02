import { db } from "@/lib/drizzle";
import { tasks, projects, members, users } from "@/lib/schemas_drizzle";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/projects/performance?workspaceId=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json(
      { error: "workspaceId required" },
      { status: 400 }
    );
  }

  // Get all projects in the workspace
  const projectList = await db
    .select()
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId));

  // Get all members and users for the workspace (for name lookup)
  const memberRows = await db
    .select({
      memberId: members.id,
      userId: members.userId,
      name: users.name,
      lastName: users.lastName,
    })
    .from(members)
    .innerJoin(users, eq(members.userId, users.id))
    .where(eq(members.workspaceId, workspaceId));

  // Map memberId to name
  const memberIdToName: Record<string, string> = {};
  memberRows.forEach((m) => {
    memberIdToName[m.memberId] = `${m.name} ${m.lastName}`;
  });

  // For each project, get task stats
  const stats = await Promise.all(
    projectList.map(async (project) => {
      // All tasks for this project
      const projectTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, project.id));
      const completedTasks = projectTasks.filter((t) => t.status === "DONE");
      const totalTasks = projectTasks.length;
      const completedCount = completedTasks.length;

      // --- Average completion time (overall and by type) ---
      let avgCompletionTime: number | null = null;
      const times = completedTasks
        .filter((t) => t.dueDate !== null && t.updatedAt !== null)
        .map((t) => {
          const updatedAt =
            typeof t.updatedAt === "string"
              ? t.updatedAt
              : t.updatedAt?.toISOString() ?? "";
          const dueDate =
            typeof t.dueDate === "string"
              ? t.dueDate
              : t.dueDate?.toISOString() ?? "";
          return new Date(updatedAt).getTime() - new Date(dueDate).getTime();
        })
        .filter((diff) => diff >= 0);
      if (times.length > 0) {
        avgCompletionTime = times.reduce((a, b) => a + b, 0) / times.length;
      }

      // --- Average completion time by type ---
      const types = ["Easy", "Medium", "Hard"];
      const avgCompletionTimeByType: Record<string, number | null> = {};
      const completedCountByType: Record<string, number> = {};
      types.forEach((type) => {
        const filtered = completedTasks.filter(
          (t) =>
            t.difficulty === type && t.dueDate !== null && t.updatedAt !== null
        );
        const times = filtered
          .map((t) => {
            const updatedAt =
              typeof t.updatedAt === "string"
                ? t.updatedAt
                : t.updatedAt?.toISOString() ?? "";
            const dueDate =
              typeof t.dueDate === "string"
                ? t.dueDate
                : t.dueDate?.toISOString() ?? "";
            return new Date(updatedAt).getTime() - new Date(dueDate).getTime();
          })
          .filter((diff) => diff >= 0);
        avgCompletionTimeByType[type] =
          times.length > 0
            ? times.reduce((a, b) => a + b, 0) / times.length
            : null;
        completedCountByType[type] = filtered.length;
      });

      // --- Per-member completion count by type ---
      const memberStats: Record<
        string,
        { name: string; total: number; byType: Record<string, number> }
      > = {};
      completedTasks.forEach((t) => {
        if (t.assigneeId) {
          const name = memberIdToName[t.assigneeId] || t.assigneeId;
          if (!memberStats[t.assigneeId]) {
            memberStats[t.assigneeId] = {
              name,
              total: 0,
              byType: { Easy: 0, Medium: 0, Hard: 0 },
            };
          }
          memberStats[t.assigneeId].total += 1;
          if (
            t.difficulty &&
            memberStats[t.assigneeId].byType[t.difficulty] !== undefined
          ) {
            memberStats[t.assigneeId].byType[t.difficulty] += 1;
          }
        }
      });

      return {
        projectId: project.id,
        projectName: project.name,
        totalTasks,
        completedCount,
        avgCompletionTime,
        avgCompletionTimeByType,
        completedCountByType,
        memberStats: Object.values(memberStats),
      };
    })
  );

  return NextResponse.json({ stats });
}
