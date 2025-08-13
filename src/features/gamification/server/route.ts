import { Hono } from "hono";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { db } from "@/lib/drizzle";
import { members, tasks, users } from "@/lib/schemas_drizzle";
import { sessionMiddleware } from "@/lib/session";
import { getMember } from "@/features/members/utils";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono()
  .get(
    "/stats",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        memberId: z.string().optional(),
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);
      
      const { workspaceId, memberId } = c.req.valid("query");
      const [member] = await getMember(workspaceId, user.id);
      if (!member) return c.json({ error: "Unauthorized" }, 401);

      // Use provided memberId or current user's member ID
      const targetMemberId = memberId || member.id;

      // Get member info
      const [targetMember] = await db
        .select()
        .from(members)
        .where(eq(members.id, targetMemberId));

      if (!targetMember) {
        return c.json({ error: "Member not found" }, 404);
      }

      // Get total completed tasks
      const completedTasksResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(tasks)
        .where(
          and(
            eq(tasks.assigneeId, targetMemberId),
            eq(tasks.workspaceId, workspaceId),
            eq(tasks.status, "DONE")
          )
        );

      const totalCompleted = completedTasksResult[0]?.count || 0;

      // Get completed tasks by difficulty
      const difficultyStatsResult = await db
        .select({
          difficulty: tasks.difficulty,
          count: sql<number>`count(*)`
        })
        .from(tasks)
        .where(
          and(
            eq(tasks.assigneeId, targetMemberId),
            eq(tasks.workspaceId, workspaceId),
            eq(tasks.status, "DONE")
          )
        )
        .groupBy(tasks.difficulty);

      const tasksCompletedByDifficulty = difficultyStatsResult.reduce(
        (acc, row) => {
          acc[row.difficulty] = row.count;
          return acc;
        },
        { Facil: 0, Medio: 0, Dificil: 0 } as Record<string, number>
      );

      // Get tasks completed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tasksCompletedTodayResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(tasks)
        .where(
          and(
            eq(tasks.assigneeId, targetMemberId),
            eq(tasks.workspaceId, workspaceId),
            eq(tasks.status, "DONE"),
            gte(tasks.updatedAt, today)
          )
        );

      const tasksCompletedToday = tasksCompletedTodayResult[0]?.count || 0;

      // Calculate consecutive days streak
      const currentStreak = await calculateStreak(targetMemberId);

      // For now, collaborative tasks = total tasks (can be refined later)
      const collaborativeTasks = totalCompleted;

      // Parse earned badges
      let earnedBadges: string[] = [];
      try {
        earnedBadges = targetMember.earnedBadges ? JSON.parse(targetMember.earnedBadges) : [];
      } catch {
        earnedBadges = [];
      }

      return c.json({
        data: {
          totalTasksCompleted: totalCompleted,
          totalPoints: targetMember.points || 0,
          tasksCompletedByDifficulty,
          tasksCompletedToday,
          currentStreak,
          collaborativeTasks,
          earnedBadges,
        }
      });
    }
  );

// Helper function to calculate streak
async function calculateStreak(memberId: string): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const completions = await db
    .select({
      date: sql<string>`DATE(${tasks.updatedAt})`
    })
    .from(tasks)
    .where(
      and(
        eq(tasks.assigneeId, memberId),
        eq(tasks.status, "DONE"),
        gte(tasks.updatedAt, thirtyDaysAgo)
      )
    )
    .groupBy(sql`DATE(${tasks.updatedAt})`)
    .orderBy(desc(sql`DATE(${tasks.updatedAt})`));

  if (completions.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < completions.length; i++) {
    const completionDate = new Date(completions[i].date);
    completionDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - streak);

    if (completionDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else if (streak === 0 && completionDate.getTime() === today.getTime()) {
      streak = 1;
    } else {
      break;
    }
  }

  return streak;
}

export default app;
