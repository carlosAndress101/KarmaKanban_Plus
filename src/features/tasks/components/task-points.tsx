import { cn } from "@/lib/utils";
import { getTaskPoints, getPointsColor } from "../utils/points";
import { TrophyIcon } from "lucide-react";

interface TaskPointsProps {
  difficulty: string | null | undefined;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const TaskPoints = ({ difficulty, className, size = "sm" }: TaskPointsProps) => {
  const points = getTaskPoints(difficulty);
  const colorClasses = getPointsColor(points);

  if (points === 0) return null;

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-5 h-5"
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-1 rounded-full border font-medium",
      colorClasses,
      sizeClasses[size],
      className
    )}>
      <TrophyIcon className={iconSizes[size]} />
      <span>{points}</span>
    </div>
  );
};
