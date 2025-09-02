import { Badge, EARNABLE_BADGES, getBadgeById } from "../constants/badges";

export interface MemberStats {
  totalTasksCompleted: number;
  totalPoints: number;
  tasksCompletedByDifficulty: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  tasksCompletedToday: number;
  currentStreak: number;
  collaborativeTasks: number;
  earnedBadges: string[];
  averageCompletionTime?: number; // in seconds, optional
  averageCompletionTimeByDifficulty?: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
}

export interface BadgeCheckResult {
  badge: Badge;
  earned: boolean;
  progress: number; // 0-1, how close to earning the badge
}

/**
 * Check which badges a member should have earned based on their stats
 */
export function checkEarnedBadges(stats: MemberStats): BadgeCheckResult[] {
  const results: BadgeCheckResult[] = [];

  for (const badge of EARNABLE_BADGES) {
    if (!badge.requirement) continue;

    const alreadyEarned = stats.earnedBadges.includes(badge.id);
    let progress = 0;
    let earned = false;

    switch (badge.requirement.type) {
      case "tasks_completed":
        progress = Math.min(
          stats.totalTasksCompleted / badge.requirement.value,
          1
        );
        earned = stats.totalTasksCompleted >= badge.requirement.value;
        break;

      case "points":
        progress = Math.min(stats.totalPoints / badge.requirement.value, 1);
        earned = stats.totalPoints >= badge.requirement.value;
        break;

      case "difficulty":
        if (badge.requirement.difficulty) {
          const difficultyCount =
            stats.tasksCompletedByDifficulty[
              badge.requirement
                .difficulty as keyof typeof stats.tasksCompletedByDifficulty
            ] || 0;
          progress = Math.min(difficultyCount / badge.requirement.value, 1);
          earned = difficultyCount >= badge.requirement.value;
        }
        break;

      case "speed":
        progress = Math.min(
          stats.tasksCompletedToday / badge.requirement.value,
          1
        );
        earned = stats.tasksCompletedToday >= badge.requirement.value;
        break;

      case "streak":
        progress = Math.min(stats.currentStreak / badge.requirement.value, 1);
        earned = stats.currentStreak >= badge.requirement.value;
        break;

      case "collaboration":
        progress = Math.min(
          stats.collaborativeTasks / badge.requirement.value,
          1
        );
        earned = stats.collaborativeTasks >= badge.requirement.value;
        break;
    }

    // Only mark as earned if not already earned
    if (earned && !alreadyEarned) {
      results.push({
        badge,
        earned: true,
        progress: 1,
      });
    } else {
      results.push({
        badge,
        earned: false,
        progress,
      });
    }
  }

  return results;
}

/**
 * Get newly earned badges (badges that should be awarded)
 */
export function getNewlyEarnedBadges(stats: MemberStats): Badge[] {
  const results = checkEarnedBadges(stats);
  return results
    .filter((result) => result.earned)
    .map((result) => result.badge);
}

/**
 * Get badges that are close to being earned (>75% progress)
 */
export function getNearlyEarnedBadges(stats: MemberStats): BadgeCheckResult[] {
  const results = checkEarnedBadges(stats);
  return results.filter((result) => !result.earned && result.progress >= 0.75);
}

/**
 * Calculate badge progress for UI display
 */
export function getBadgeProgress(badgeId: string, stats: MemberStats): number {
  const badge = getBadgeById(badgeId);
  if (!badge || !badge.requirement) return 0;

  switch (badge.requirement.type) {
    case "tasks_completed":
      return Math.min(stats.totalTasksCompleted / badge.requirement.value, 1);
    case "points":
      return Math.min(stats.totalPoints / badge.requirement.value, 1);
    case "difficulty":
      if (badge.requirement.difficulty) {
        const difficultyCount =
          stats.tasksCompletedByDifficulty[
            badge.requirement
              .difficulty as keyof typeof stats.tasksCompletedByDifficulty
          ] || 0;
        return Math.min(difficultyCount / badge.requirement.value, 1);
      }
      return 0;
    case "speed":
      return Math.min(stats.tasksCompletedToday / badge.requirement.value, 1);
    case "streak":
      return Math.min(stats.currentStreak / badge.requirement.value, 1);
    case "collaboration":
      return Math.min(stats.collaborativeTasks / badge.requirement.value, 1);
    default:
      return 0;
  }
}

/**
 * Format progress text for badge requirements
 */
export function formatBadgeProgressText(
  badge: Badge,
  stats: MemberStats
): string {
  if (!badge.requirement) return "";

  switch (badge.requirement.type) {
    case "tasks_completed":
      return `${Math.min(stats.totalTasksCompleted, badge.requirement.value)}/${
        badge.requirement.value
      } tasks completed`;
    case "points":
      return `${Math.min(stats.totalPoints, badge.requirement.value)}/${
        badge.requirement.value
      } points earned`;
    case "difficulty":
      if (badge.requirement.difficulty) {
        const difficultyCount =
          stats.tasksCompletedByDifficulty[
            badge.requirement
              .difficulty as keyof typeof stats.tasksCompletedByDifficulty
          ] || 0;
        const difficultyName =
          badge.requirement.difficulty === "Easy"
            ? "easy"
            : badge.requirement.difficulty === "Medium"
            ? "medium"
            : "hard";
        return `${Math.min(difficultyCount, badge.requirement.value)}/${
          badge.requirement.value
        } ${difficultyName} tasks completed`;
      }
      return "";
    case "speed":
      return `${Math.min(stats.tasksCompletedToday, badge.requirement.value)}/${
        badge.requirement.value
      } tasks completed today`;
    case "streak":
      return `${Math.min(stats.currentStreak, badge.requirement.value)}/${
        badge.requirement.value
      } day streak`;
    case "collaboration":
      return `${Math.min(stats.collaborativeTasks, badge.requirement.value)}/${
        badge.requirement.value
      } collaborative tasks`;
    default:
      return "";
  }
}
