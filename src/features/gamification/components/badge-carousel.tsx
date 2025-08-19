"use client";

import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge as BadgeType, EARNABLE_BADGES } from "../constants/badges";

interface BadgeCarouselProps {
  earnedBadgeIds: string[];
  onViewAllBadges: () => void;
}

export const BadgeCarousel: React.FC<BadgeCarouselProps> = ({
  earnedBadgeIds,
  onViewAllBadges,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Get earned badges with their details
  const earnedBadges = EARNABLE_BADGES.filter((badge) =>
    earnedBadgeIds.includes(badge.id)
  );

  // If no badges are earned, show placeholder
  if (earnedBadges.length === 0) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Lock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500 mb-1">No badges earned yet</p>
          <p className="text-xs text-gray-400">
            Complete tasks to unlock your first badge!
          </p>
        </div>
        <Button
          onClick={onViewAllBadges}
          variant="outline"
          size="sm"
          className="w-full"
        >
          View All Badges
        </Button>
      </div>
    );
  }

  // Show as many as fit in the viewport
  const maxVisible = earnedBadges.length;
  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < earnedBadges.length - 1;

  const scrollToBadge = (idx: number) => {
    setCurrentIndex(idx);
    if (carouselRef.current) {
      const badgeWidth = carouselRef.current.offsetWidth / maxVisible;
      carouselRef.current.scrollTo({
        left: badgeWidth * idx,
        behavior: "smooth",
      });
    }
  };

  const nextBadges = () => {
    if (canGoRight) scrollToBadge(currentIndex + 1);
  };
  const prevBadges = () => {
    if (canGoLeft) scrollToBadge(currentIndex - 1);
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full px-2">
        <h3 className="font-bold text-lg text-gray-700 tracking-wide">
          Your Badges
        </h3>
        <span className="text-sm text-gray-500">
          {earnedBadges.length} earned
        </span>
      </div>

      {/* Carousel Container */}
      <div className="relative w-full">
        {/* Navigation Buttons */}
        {earnedBadges.length > maxVisible && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className={`absolute -left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 ${
                !canGoLeft ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={prevBadges}
              disabled={!canGoLeft}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`absolute -right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 ${
                !canGoRight ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={nextBadges}
              disabled={!canGoRight}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Horizontal Carousel */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto no-scrollbar py-4 px-2 snap-x snap-mandatory w-full"
          style={{ scrollBehavior: "smooth" }}
        >
          {earnedBadges.map((badge, idx) => {
            const IconComponent = badge.icon;
            const isActive = idx === currentIndex;
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center p-4 min-w-[140px] max-w-[140px] bg-white border border-gray-200 rounded-2xl shadow transition-all duration-300 cursor-pointer group snap-center ${
                  isActive
                    ? "scale-110 ring-2 ring-blue-400 z-10"
                    : "opacity-80"
                } hover:scale-105`}
                title={badge.name}
                onClick={() => scrollToBadge(idx)}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${badge.color} mb-2 shadow-md`}
                >
                  <IconComponent className="w-8 h-8" />
                </div>
                <span className="text-base text-center font-semibold leading-tight group-hover:text-blue-600 transition-colors">
                  {badge.name}
                </span>
                <span className="text-xs text-gray-400 mt-1 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {badge.description}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Indicator */}
        {earnedBadges.length > maxVisible && (
          <div className="flex justify-center mt-2 space-x-1">
            {earnedBadges.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentIndex ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* View All Button */}
      <Button
        onClick={onViewAllBadges}
        variant="outline"
        size="sm"
        className="w-full"
      >
        View All Badges
      </Button>
    </div>
  );
};
