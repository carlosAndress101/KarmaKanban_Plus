import React from "react";
import {
  Sparkles,
  Zap,
  Bug,
  AlertTriangle,
  Shield,
  Gauge,
  Palette,
  Plus,
} from "lucide-react";
import { ChangeType } from "../types";

interface ChangeTypeIconProps {
  type: ChangeType;
  className?: string;
}

const CHANGE_TYPE_CONFIG = {
  [ChangeType.NEW_FEATURE]: {
    icon: Sparkles,
    color: "text-green-600",
    bgColor: "bg-green-50",
    label: "New Feature",
  },
  [ChangeType.IMPROVEMENT]: {
    icon: Zap,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    label: "Improvement",
  },
  [ChangeType.BUG_FIX]: {
    icon: Bug,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    label: "Bug Fix",
  },
  [ChangeType.BREAKING_CHANGE]: {
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    label: "Breaking Change",
  },
  [ChangeType.SECURITY]: {
    icon: Shield,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    label: "Security",
  },
  [ChangeType.PERFORMANCE]: {
    icon: Gauge,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    label: "Performance",
  },
  [ChangeType.UI_UX]: {
    icon: Palette,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    label: "UI/UX",
  },
};

export const ChangeTypeIcon: React.FC<ChangeTypeIconProps> = ({
  type,
  className = "h-4 w-4",
}) => {
  const config = CHANGE_TYPE_CONFIG[type];
  const IconComponent = config.icon;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full p-1.5 ${config.bgColor}`}
    >
      <IconComponent className={`${className} ${config.color}`} />
    </div>
  );
};

interface ChangeTypeBadgeProps {
  type: ChangeType;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ChangeTypeBadge: React.FC<ChangeTypeBadgeProps> = ({
  type,
  showLabel = true,
  size = "md",
}) => {
  const config = CHANGE_TYPE_CONFIG[type];
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-2.5 py-1.5 text-sm",
    lg: "px-3 py-2 text-base",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bgColor} ${config.color} ${sizeClasses[size]}`}
    >
      <IconComponent className={iconSizes[size]} />
      {showLabel && config.label}
    </span>
  );
};

export const getChangeTypeConfig = (type: ChangeType) => {
  return CHANGE_TYPE_CONFIG[type];
};
