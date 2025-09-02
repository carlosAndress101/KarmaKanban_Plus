import {
  Trophy,
  Target,
  Zap,
  Star,
  Users,
  Crown,
  Rocket,
  Shield,
  Medal,
  Award,
  Flame,
  Clock,
  CheckCircle,
  Coffee,
  Sparkles,
  Hexagon,
  Heart,
} from "lucide-react";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: typeof Trophy;
  color: string;
  type: "earnable" | "purchasable";
  requirement?: {
    type:
      | "tasks_completed"
      | "points"
      | "streak"
      | "difficulty"
      | "speed"
      | "collaboration";
    value: number;
    difficulty?: string;
  };
  price?: number; // For purchasable badges
}

// 20 Earnable Badges (earned by completing tasks and achievements)
export const EARNABLE_BADGES: Badge[] = [
  // Task Completion Milestones (5 badges)
  {
    id: "first_task",
    name: "First Steps",
    description: "Complete your first task",
    icon: CheckCircle,
    color: "text-green-600 bg-green-50",
    type: "earnable",
    requirement: { type: "tasks_completed", value: 1 },
  },
  {
    id: "task_novice",
    name: "Task Novice",
    description: "Complete 5 tasks",
    icon: Target,
    color: "text-blue-600 bg-blue-50",
    type: "earnable",
    requirement: { type: "tasks_completed", value: 5 },
  },
  {
    id: "task_veteran",
    name: "Task Veteran",
    description: "Complete 25 tasks",
    icon: Medal,
    color: "text-purple-600 bg-purple-50",
    type: "earnable",
    requirement: { type: "tasks_completed", value: 25 },
  },
  {
    id: "task_master",
    name: "Task Master",
    description: "Complete 50 tasks",
    icon: Crown,
    color: "text-yellow-600 bg-yellow-50",
    type: "earnable",
    requirement: { type: "tasks_completed", value: 50 },
  },
  {
    id: "century_club",
    name: "Century Club",
    description: "Complete 100 tasks",
    icon: Trophy,
    color: "text-yellow-600 bg-yellow-50",
    type: "earnable",
    requirement: { type: "tasks_completed", value: 100 },
  },

  // Difficulty-based Badges (6 badges)
  {
    id: "easy_rider",
    name: "Easy Rider",
    description: "Complete 5 easy tasks",
    icon: Coffee,
    color: "text-green-600 bg-green-50",
    type: "earnable",
    requirement: { type: "difficulty", value: 5, difficulty: "Easy" },
  },
  {
    id: "easy_master",
    name: "Easy Master",
    description: "Complete 20 easy tasks",
    icon: CheckCircle,
    color: "text-green-600 bg-green-50",
    type: "earnable",
    requirement: { type: "difficulty", value: 20, difficulty: "Easy" },
  },
  {
    id: "steady_achiever",
    name: "Steady Achiever",
    description: "Complete 5 medium tasks",
    icon: Zap,
    color: "text-orange-600 bg-orange-50",
    type: "earnable",
    requirement: { type: "difficulty", value: 5, difficulty: "Medium" },
  },
  {
    id: "medium_master",
    name: "Medium Master",
    description: "Complete 15 medium tasks",
    icon: Award,
    color: "text-orange-600 bg-orange-50",
    type: "earnable",
    requirement: { type: "difficulty", value: 15, difficulty: "Medium" },
  },
  {
    id: "challenge_seeker",
    name: "Challenge Seeker",
    description: "Complete 3 hard tasks",
    icon: Flame,
    color: "text-red-600 bg-red-50",
    type: "earnable",
    requirement: { type: "difficulty", value: 3, difficulty: "Hard" },
  },
  {
    id: "hard_master",
    name: "Hard Master",
    description: "Complete 10 hard tasks",
    icon: Shield,
    color: "text-red-600 bg-red-50",
    type: "earnable",
    requirement: { type: "difficulty", value: 10, difficulty: "Hard" },
  },

  // Points-based Badges (4 badges)
  {
    id: "point_collector",
    name: "Point Collector",
    description: "Earn 100 points",
    icon: Star,
    color: "text-yellow-600 bg-yellow-50",
    type: "earnable",
    requirement: { type: "points", value: 100 },
  },
  {
    id: "point_accumulator",
    name: "Point Accumulator",
    description: "Earn 500 points",
    icon: Award,
    color: "text-purple-600 bg-purple-50",
    type: "earnable",
    requirement: { type: "points", value: 500 },
  },
  {
    id: "point_champion",
    name: "Point Champion",
    description: "Earn 1000 points",
    icon: Trophy,
    color: "text-yellow-600 bg-yellow-50",
    type: "earnable",
    requirement: { type: "points", value: 1000 },
  },
  {
    id: "point_legend",
    name: "Point Legend",
    description: "Earn 2000 points",
    icon: Crown,
    color: "text-purple-600 bg-purple-50",
    type: "earnable",
    requirement: { type: "points", value: 2000 },
  },

  // Speed and Performance Badges (3 badges)
  {
    id: "quick_starter",
    name: "Quick Starter",
    description: "Complete 3 tasks in one day",
    icon: Rocket,
    color: "text-blue-600 bg-blue-50",
    type: "earnable",
    requirement: { type: "speed", value: 3 },
  },
  {
    id: "productivity_guru",
    name: "Productivity Guru",
    description: "Complete 5 tasks in one day",
    icon: Clock,
    color: "text-indigo-600 bg-indigo-50",
    type: "earnable",
    requirement: { type: "speed", value: 5 },
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Complete 8 tasks in one day",
    icon: Zap,
    color: "text-yellow-600 bg-yellow-50",
    type: "earnable",
    requirement: { type: "speed", value: 8 },
  },

  // Consistency and Collaboration Badges (2 badges)
  {
    id: "consistency_badge",
    name: "Consistent Contributor",
    description: "Complete tasks for 5 consecutive days",
    icon: Shield,
    color: "text-emerald-600 bg-emerald-50",
    type: "earnable",
    requirement: { type: "streak", value: 5 },
  },
  {
    id: "team_player",
    name: "Team Player",
    description: "Complete 10 tasks in collaboration",
    icon: Users,
    color: "text-cyan-600 bg-cyan-50",
    type: "earnable",
    requirement: { type: "collaboration", value: 10 },
  },
];

// 3 Purchasable Badges (can be bought with points)
export const PURCHASABLE_BADGES: Badge[] = [
  {
    id: "premium_supporter",
    name: "Premium Supporter",
    description: "Show your commitment to the team",
    icon: Hexagon,
    color: "text-violet-600 bg-violet-50",
    type: "purchasable",
    price: 200,
  },
  {
    id: "golden_contributor",
    name: "Golden Contributor",
    description: "A mark of excellence and dedication",
    icon: Sparkles,
    color: "text-amber-600 bg-amber-50",
    type: "purchasable",
    price: 350,
  },
  {
    id: "team_benefactor",
    name: "Team Benefactor",
    description: "Supporting team growth and success",
    icon: Heart,
    color: "text-rose-600 bg-rose-50",
    type: "purchasable",
    price: 500,
  },
];

export const ALL_BADGES: Badge[] = [...EARNABLE_BADGES, ...PURCHASABLE_BADGES];

export const getBadgeById = (id: string): Badge | undefined => {
  return ALL_BADGES.find((badge) => badge.id === id);
};

export const getEarnableBadges = (): Badge[] => EARNABLE_BADGES;
export const getPurchasableBadges = (): Badge[] => PURCHASABLE_BADGES;
