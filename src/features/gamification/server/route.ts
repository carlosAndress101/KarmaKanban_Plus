import { Hono } from "hono";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { db } from "@/lib/drizzle";
import { members, tasks, memberBadges, users } from "@/lib/schemas_drizzle";
import { sessionMiddleware } from "@/lib/session";
import { getMember } from "@/features/members/utils";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono()
  // Get completed tasks history for a member
  .get(
    "/tasks-history",
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
      const targetMemberId = memberId || member.id;

      // Calculate average task completion time (in seconds) overall
      // (Result not used in this endpoint)

      // Calculate average completion time by difficulty
      const difficulties: Array<"Easy" | "Medium" | "Hard"> = [
        "Easy",
        "Medium",
        "Hard",
      ];
      const avgByDifficulty: Record<"Easy" | "Medium" | "Hard", number> = {
        Easy: 0,
        Medium: 0,
        Hard: 0,
      };
      for (const diff of difficulties) {
        const res = await db
          .select({
            avgSeconds: sql<number>`AVG(EXTRACT(EPOCH FROM (${tasks.updatedAt} - ${tasks.createdAt})))`,
          })
          .from(tasks)
          .where(
            and(
              eq(tasks.assigneeId, targetMemberId),
              eq(tasks.workspaceId, workspaceId),
              eq(tasks.status, "DONE"),
              eq(tasks.difficulty, diff),
              sql`(${tasks.createdAt} IS NOT NULL AND ${tasks.updatedAt} IS NOT NULL)`
            )
          );
        avgByDifficulty[diff] = res[0]?.avgSeconds || 0;
      }

      // Query completed tasks for this member
      const completedTasks = await db
        .select({
          id: tasks.id,
          name: tasks.name,
          difficulty: tasks.difficulty,
          points: sql<number>`CASE ${tasks.difficulty} WHEN 'Easy' THEN 10 WHEN 'Medium' THEN 20 WHEN 'Hard' THEN 30 ELSE 0 END`,
          completedAt: tasks.updatedAt,
        })
        .from(tasks)
        .where(
          and(
            eq(tasks.assigneeId, targetMemberId),
            eq(tasks.workspaceId, workspaceId),
            eq(tasks.status, "DONE")
          )
        )
        .orderBy(desc(tasks.updatedAt));
      return c.json({ data: completedTasks });
    }
  )

  // Get earned badges history for a member
  .get(
    "/badges-history",
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
      const targetMemberId = memberId || member.id;
      // Get member info
      const [targetMember] = await db
        .select()
        .from(members)
        .where(eq(members.id, targetMemberId));
      if (!targetMember) {
        return c.json({ error: "Member not found" }, 404);
      }
      // Query member_badges for earned badges with date
      const badgeRows = await db
        .select({
          badgeId: sql<string>`badge_id`,
          earnedAt: sql<string>`earned_at`,
        })
        .from(memberBadges)
        .where(eq(memberBadges.memberId, targetMemberId))
        .orderBy(desc(memberBadges.earnedAt));

      const { EARNABLE_BADGES } = await import("../constants/badges");
      const badgeHistory = badgeRows.map((row) => {
        const badge = EARNABLE_BADGES.find(
          (b: { id: string }) => b.id === row.badgeId
        );
        return badge
          ? { id: badge.id, name: badge.name, earnedAt: row.earnedAt }
          : { id: row.badgeId, name: "Unknown Badge", earnedAt: row.earnedAt };
      });
      return c.json({ data: badgeHistory });
    }
  )
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
          count: sql<number>`count(*)`,
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
        { Easy: 0, Medium: 0, Hard: 0 } as Record<string, number>
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
        earnedBadges = targetMember.earnedBadges
          ? JSON.parse(targetMember.earnedBadges)
          : [];
      } catch {
        earnedBadges = [];
      }

      // Calculate average task completion time (in seconds)
      // Only consider tasks with both createdAt and updatedAt
      const avgCompletionResult = await db
        .select({
          avgSeconds: sql<number>`AVG(EXTRACT(EPOCH FROM (${tasks.updatedAt} - ${tasks.createdAt})))`,
        })
        .from(tasks)
        .where(
          and(
            eq(tasks.assigneeId, targetMemberId),
            eq(tasks.workspaceId, workspaceId),
            eq(tasks.status, "DONE"),
            sql`(${tasks.createdAt} IS NOT NULL AND ${tasks.updatedAt} IS NOT NULL)`
          )
        );
      const averageCompletionTime = avgCompletionResult[0]?.avgSeconds || 0;

      // Calculate average completion time by difficulty
      const difficulties: Array<"Easy" | "Medium" | "Hard"> = [
        "Easy",
        "Medium",
        "Hard",
      ];
      const avgByDifficulty: Record<"Easy" | "Medium" | "Hard", number> = {
        Easy: 0,
        Medium: 0,
        Hard: 0,
      };
      for (const diff of difficulties) {
        const res = await db
          .select({
            avgSeconds: sql<number>`AVG(EXTRACT(EPOCH FROM (${tasks.updatedAt} - ${tasks.createdAt})))`,
          })
          .from(tasks)
          .where(
            and(
              eq(tasks.assigneeId, targetMemberId),
              eq(tasks.workspaceId, workspaceId),
              eq(tasks.status, "DONE"),
              eq(tasks.difficulty, diff),
              sql`(${tasks.createdAt} IS NOT NULL AND ${tasks.updatedAt} IS NOT NULL)`
            )
          );
        avgByDifficulty[diff] = res[0]?.avgSeconds || 0;
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
          averageCompletionTime, // in seconds
          averageCompletionTimeByDifficulty: avgByDifficulty,
        },
      });
    }
  )

  // Get team stats - Only for Project Managers and Admins
  .get(
    "/team-stats",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const { workspaceId } = c.req.valid("query");
      const [member] = await getMember(workspaceId, user.id);
      if (!member) return c.json({ error: "Unauthorized" }, 401);

      // Only Project Managers and Admins can view team stats
      if (
        member.role !== "admin" &&
        member.gamificationRole !== "Project Manager"
      ) {
        return c.json(
          {
            error:
              "Unauthorized. Only Project Managers and admins can view team statistics.",
          },
          403
        );
      }

      // Get all members in the workspace with user details
      const allMembers = await db
        .select({
          id: members.id,
          userId: members.userId,
          name: sql<string>`CONCAT(${users.name}, ' ', ${users.lastName})`,
          email: users.email,
          gamificationRole: members.gamificationRole,
          points: members.points,
        })
        .from(members)
        .innerJoin(users, eq(members.userId, users.id))
        .where(eq(members.workspaceId, workspaceId));

      // Get task stats for each member
      const teamStats = await Promise.all(
        allMembers.map(async (teamMember) => {
          // Get completed tasks by difficulty for this member
          const difficultyStatsResult = await db
            .select({
              difficulty: tasks.difficulty,
              count: sql<number>`count(*)`,
            })
            .from(tasks)
            .where(
              and(
                eq(tasks.assigneeId, teamMember.id),
                eq(tasks.workspaceId, workspaceId),
                eq(tasks.status, "DONE")
              )
            )
            .groupBy(tasks.difficulty);

          const tasksCompletedByDifficulty = difficultyStatsResult.reduce(
            (acc, row) => {
              acc[row.difficulty] = Number(row.count) || 0;
              return acc;
            },
            { Easy: 0, Medium: 0, Hard: 0 } as Record<string, number>
          );

          // Calculate points earned by difficulty
          const pointsByDifficulty = {
            Easy: Number(tasksCompletedByDifficulty.Easy) * 10 || 0,
            Medium: Number(tasksCompletedByDifficulty.Medium) * 20 || 0,
            Hard: Number(tasksCompletedByDifficulty.Hard) * 30 || 0,
          };

          // Calculate total historical points earned (from completed tasks)
          const totalHistoricalPoints =
            pointsByDifficulty.Easy +
            pointsByDifficulty.Medium +
            pointsByDifficulty.Hard;

          // Get total completed tasks
          const totalCompleted =
            Number(
              tasksCompletedByDifficulty.Easy +
                tasksCompletedByDifficulty.Medium +
                tasksCompletedByDifficulty.Hard
            ) || 0;

          // Get earned badges from member_badges table
          const memberBadgesResult = await db
            .select({
              badgeId: memberBadges.badgeId,
              earnedAt: memberBadges.earnedAt,
            })
            .from(memberBadges)
            .where(eq(memberBadges.memberId, teamMember.id))
            .orderBy(desc(memberBadges.earnedAt));

          // Parse earned badges from member record as fallback
          let earnedBadges: string[] = [];
          try {
            const memberRecord = await db
              .select({ earnedBadges: members.earnedBadges })
              .from(members)
              .where(eq(members.id, teamMember.id))
              .limit(1);

            earnedBadges = memberRecord[0]?.earnedBadges
              ? JSON.parse(memberRecord[0].earnedBadges)
              : [];
          } catch {
            earnedBadges = [];
          }

          // Combine badges from both sources
          const allBadgeIds = new Set([
            ...memberBadgesResult.map((b) => b.badgeId),
            ...earnedBadges,
          ]);

          return {
            memberId: teamMember.id,
            name: teamMember.name,
            email: teamMember.email,
            gamificationRole: teamMember.gamificationRole,
            totalPoints: teamMember.points || 0,
            totalHistoricalPoints: totalHistoricalPoints,
            totalTasksCompleted: totalCompleted,
            tasksCompletedByDifficulty,
            pointsByDifficulty,
            earnedBadges: Array.from(allBadgeIds),
          };
        })
      );

      return c.json({
        data: teamStats,
      });
    }
  );

// Helper function to calculate streak
async function calculateStreak(memberId: string): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const completions = await db
    .select({
      date: sql<string>`DATE(${tasks.updatedAt})`,
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
