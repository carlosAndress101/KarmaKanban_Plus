"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge as BadgeType, EARNABLE_BADGES } from "../constants/badges";

interface BadgeCarouselProps {
  earnedBadgeIds: string[];
  onViewAllBadges: () => void;
}

export const BadgeCarousel: React.FC<BadgeCarouselProps> = ({ earnedBadgeIds, onViewAllBadges }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const maxVisible = 3; // Number of badges visible at once

  // Get earned badges with their details
  const earnedBadges = EARNABLE_BADGES.filter(badge => earnedBadgeIds.includes(badge.id));
  
  // If no badges are earned, show placeholder
  if (earnedBadges.length === 0) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Lock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500 mb-1">No badges earned yet</p>
          <p className="text-xs text-gray-400">Complete tasks to unlock your first badge!</p>
        </div>
        <Button onClick={onViewAllBadges} variant="outline" size="sm" className="w-full">
          View All Badges
        </Button>
      </div>
    );
  }

  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < earnedBadges.length - maxVisible;

  const nextBadges = () => {
    if (canGoRight) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevBadges = () => {
    if (canGoLeft) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const visibleBadges = earnedBadges.slice(currentIndex, currentIndex + maxVisible);

  return (
    <div className="flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-700">Your Badges</h3>
        <span className="text-xs text-gray-500">{earnedBadges.length} earned</span>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Buttons */}
        {earnedBadges.length > maxVisible && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className={`absolute -left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 ${
                !canGoLeft ? 'opacity-50 cursor-not-allowed' : ''
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
                !canGoRight ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={nextBadges}
              disabled={!canGoRight}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Badges Grid */}
        <div className="grid grid-cols-3 gap-2">
          {visibleBadges.map((badge, index) => {
            const IconComponent = badge.icon;
            return (
              <div
                key={badge.id}
                className="flex flex-col items-center p-2 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer group"
                title={badge.name}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${badge.color} mb-1`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="text-xs text-center font-medium leading-tight group-hover:text-blue-600 transition-colors">
                  {badge.name}
                </span>
              </div>
            );
          })}
          
          {/* Fill empty slots if less than maxVisible */}
          {visibleBadges.length < maxVisible && (
            Array.from({ length: maxVisible - visibleBadges.length }).map((_, index) => (
              <div key={`empty-${index}`} className="flex flex-col items-center p-2">
                {/* Empty slot */}
              </div>
            ))
          )}
        </div>

        {/* Progress Indicator */}
        {earnedBadges.length > maxVisible && (
          <div className="flex justify-center mt-2 space-x-1">
            {Array.from({ length: Math.ceil(earnedBadges.length / maxVisible) }).map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  Math.floor(currentIndex / maxVisible) === index ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* View All Button */}
      <Button onClick={onViewAllBadges} variant="outline" size="sm" className="w-full">
        View All Badges
      </Button>
    </div>
  );
};
