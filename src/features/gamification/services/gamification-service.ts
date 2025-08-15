import { db } from "@/lib/drizzle";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { members, tasks, projects } from "@/lib/schemas_drizzle";
import { EARNABLE_BADGES } from "../constants/badges";

// Point values based on task difficulty
const POINTS_BY_DIFFICULTY = {
  Facil: 10, // Easy tasks = 10 points
  Medio: 20, // Medium tasks = 20 points
  Dificil: 30, // Hard tasks = 30 points
} as const;

export class GamificationService {
  /**
   * Awards points and checks badges when a task is completed (moved to DONE)
   */
  static async awardPointsForTaskCompletion(
    taskId: string,
    memberId: string
  ): Promise<void> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));

    if (!task || !task.assigneeId) {
      console.log(`⚠️  Task ${taskId} not found or has no assignee`);
      return;
    }

    const pointsToAward = POINTS_BY_DIFFICULTY[task.difficulty];
    console.log(
      `💰 Awarding ${pointsToAward} points for ${task.difficulty} task ${taskId} to member ${memberId}`
    );

    // Award points to the member
    await db
      .update(members)
      .set({ points: sql`points + ${pointsToAward}` })
      .where(eq(members.id, memberId));

    // Check for new badge achievements
    const newBadges = await this.checkAndAwardBadges(
      memberId,
      task.workspaceId
    );
    if (newBadges.length > 0) {
      console.log(`🏆 New badges awarded: ${newBadges.join(", ")}`);
    }
  }

  /**
   * Removes points when a task is moved back from DONE to another status
   */
  static async removePointsForTaskUncompletion(
    taskId: string,
    memberId: string
  ): Promise<void> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));

    if (!task) return;

    const pointsToRemove = POINTS_BY_DIFFICULTY[task.difficulty];
    if (!pointsToRemove) {
      console.warn(
        `⚠️  Unknown difficulty '${task.difficulty}' for task ${taskId}. No points removed.`
      );
      return;
    }

    // Remove points from the member (ensure it doesn't go below 0)
    await db
      .update(members)
      .set({ points: sql`GREATEST(points - ${pointsToRemove}, 0)` })
      .where(eq(members.id, memberId));
  }

  /**
   * Checks all badge requirements and awards new badges to a member
   */
  static async checkAndAwardBadges(
    memberId: string,
    workspaceId: string
  ): Promise<string[]> {
    const [member] = await db
      .select()
      .from(members)
      .where(eq(members.id, memberId));

    if (!member) {
      console.log(
        `[Gamification] Member not found for badge check: ${memberId}`
      );
      return [];
    }

    // Parse current earned badges and filter out nulls/invalids
    let earnedBadgeIds: string[] = [];
    try {
      earnedBadgeIds = member.earnedBadges
        ? JSON.parse(member.earnedBadges)
        : [];
    } catch {
      earnedBadgeIds = [];
    }

    // Get member's task statistics
    const stats = await this.getMemberTaskStats(memberId, workspaceId);
    const newBadges: string[] = [];

    // Check each earnable badge
    for (const badge of EARNABLE_BADGES) {
      // Skip if already earned
      if (earnedBadgeIds.includes(badge.id)) continue;

      const requirement = badge.requirement;
      let earned = false;

      switch (requirement?.type) {
        case "tasks_completed":
          earned = stats.totalCompleted >= requirement.value;
          break;

        case "difficulty":
          const difficultyCount =
            stats.completedByDifficulty[requirement.difficulty || ""] || 0;
          earned = difficultyCount >= requirement.value;
          break;

        case "points":
          earned = (member.points ?? 0) >= requirement.value;
          break;

        case "speed":
          // Check tasks completed today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tasksToday = await this.getTasksCompletedSince(memberId, today);
          earned = tasksToday >= requirement.value;
          break;

        case "streak":
          // Check consecutive days with task completion
          const streak = await this.getConsecutiveDaysStreak(memberId);
          earned = streak >= requirement.value;
          break;

        case "collaboration":
          // For now, count all completed tasks as collaboration
          // In the future, this could check for tasks assigned by others
          earned = stats.totalCompleted >= requirement.value;
          break;
      }

      if (earned) {
        newBadges.push(badge.id);
        earnedBadgeIds.push(badge.id);
        console.log(
          `[Gamification] Badge earned: ${badge.id} for member ${memberId}`
        );
      }
    }

    // Update member's earned badges if there are new ones
    if (newBadges.length > 0) {
      // Filter out nulls/invalids before saving
      const filteredBadges = earnedBadgeIds.filter(
        (id) => typeof id === "string" && !!id
      );
      await db
        .update(members)
        .set({
          earnedBadges: JSON.stringify(earnedBadgeIds),
        })
        .where(eq(members.id, memberId));
      console.log(
        `[Gamification] Updated earnedBadges for member ${memberId}:`,
        filteredBadges
      );
    } else {
      console.log(
        `[Gamification] No new badges for member ${memberId}. Current badges:`,
        earnedBadgeIds
      );
    }

    return newBadges;
  }

  /**
   * Gets comprehensive task statistics for a member
   */
  private static async getMemberTaskStats(
    memberId: string,
    workspaceId: string
  ) {
    // Get all completed tasks by this member
    const completedTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.assigneeId, memberId),
          eq(tasks.workspaceId, workspaceId),
          eq(tasks.status, "DONE")
        )
      );

    // Count by difficulty
    const completedByDifficulty = completedTasks.reduce((acc, task) => {
      acc[task.difficulty] = (acc[task.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCompleted: completedTasks.length,
      completedByDifficulty,
    };
  }

  /**
   * Gets the number of tasks completed since a specific date
   */
  private static async getTasksCompletedSince(
    memberId: string,
    sinceDate: Date
  ): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.assigneeId, memberId),
          eq(tasks.status, "DONE"),
          gte(tasks.updatedAt, sinceDate)
        )
      );

    return result[0]?.count || 0;
  }

  /**
   * Calculates consecutive days with at least one task completed
   */
  private static async getConsecutiveDaysStreak(
    memberId: string
  ): Promise<number> {
    // Get all completion dates for this member (last 30 days to optimize)
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

    // Calculate consecutive streak from today backwards
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
        // First day can be today
        streak = 1;
      } else {
        // Break in streak
        break;
      }
    }

    return streak;
  }

  /**
   * Checks if a project has a Project Manager assigned
   */
  static async hasProjectManager(projectId: string): Promise<boolean> {
    const [project] = await db
      .select({ projectManagerId: projects.projectManagerId })
      .from(projects)
      .where(eq(projects.id, projectId));

    return !!project?.projectManagerId;
  }

  /**
   * Gets the Project Manager for a project
   */
  static async getProjectManager(projectId: string) {
    const result = await db
      .select({
        managerId: projects.projectManagerId,
        managerName: sql<string>`CONCAT(users.name, ' ', users.last_name)`,
        managerEmail: sql<string>`users.email`,
      })
      .from(projects)
      .leftJoin(members, eq(projects.projectManagerId, members.id))
      .leftJoin(sql`users`, eq(sql`members.user_id`, sql`users.id`))
      .where(eq(projects.id, projectId));

    return result[0];
  }
}
