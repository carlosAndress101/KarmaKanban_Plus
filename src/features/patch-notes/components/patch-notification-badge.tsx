"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bell, Star, Sparkles } from "lucide-react";

import { usePatchNotes } from "../hooks/usePatchNotes";

interface PatchNotificationBadgeProps {
  onClick?: () => void;
  variant?: "icon" | "button" | "minimal";
  showTooltip?: boolean;
  size?: "sm" | "md" | "lg";
}

export const PatchNotificationBadge: React.FC<PatchNotificationBadgeProps> = ({
  onClick,
  variant = "icon",
  showTooltip = true,
  size = "md",
}) => {
  const { hasUnreadPatches, unreadPatchesCount, latestPatch } = usePatchNotes();

  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  const badgeContent = () => {
    if (!hasUnreadPatches) return null;

    const baseElement = (() => {
      switch (variant) {
        case "button":
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={onClick}
              className="relative animate-pulse border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">New Updates</span>
                <Badge className="bg-blue-600 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                  {unreadPatchesCount}
                </Badge>
              </div>
            </Button>
          );

        case "minimal":
          return (
            <button
              onClick={onClick}
              className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Bell className={sizeClasses[size]} />
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white">
                {unreadPatchesCount > 99 ? "99+" : unreadPatchesCount}
              </Badge>
            </button>
          );

        case "icon":
        default:
          return (
            <button
              onClick={onClick}
              className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg animate-pulse`}
            >
              <Star className="h-4 w-4" />
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full border-2 border-white">
                {unreadPatchesCount > 9 ? "9+" : unreadPatchesCount}
              </Badge>
            </button>
          );
      }
    })();

    if (!showTooltip) return baseElement;

    const tooltipText = latestPatch
      ? `New update available: ${latestPatch.title} (v${latestPatch.version})`
      : `${unreadPatchesCount} new update${
          unreadPatchesCount > 1 ? "s" : ""
        } available`;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{baseElement}</TooltipTrigger>
          <TooltipContent side="bottom" align="center" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">{tooltipText}</p>
              {latestPatch && (
                <p className="text-xs text-gray-300">Click to see what's new</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return badgeContent();
};
