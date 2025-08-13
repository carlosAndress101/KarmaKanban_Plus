"use client";

import React from "react";
import { Badge as BadgeType, getBadgeById, EARNABLE_BADGES, PURCHASABLE_BADGES } from "../constants/badges";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { formatBadgeProgressText, MemberStats, getBadgeProgress } from "../utils/badge-manager";
import { ShoppingCart, Trophy, Lock, CheckCircle } from "lucide-react";

interface BadgeDisplayProps {
  memberStats: MemberStats;
  onPurchaseBadge?: (badgeId: string) => void;
}

interface BadgeCardProps {
  badge: BadgeType;
  isEarned: boolean;
  progress?: number;
  memberStats?: MemberStats;
  onPurchase?: (badgeId: string) => void;
  canAfford?: boolean;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ 
  badge, 
  isEarned, 
  progress = 0, 
  memberStats, 
  onPurchase,
  canAfford = false 
}) => {
  const IconComponent = badge.icon;
  const progressPercent = Math.round(progress * 100);

  return (
    <Card className={`relative transition-all hover:shadow-md ${isEarned ? 'ring-2 ring-yellow-300' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${badge.color}`}>
            <IconComponent className="w-6 h-6" />
          </div>
          {isEarned && (
            <CheckCircle className="w-6 h-6 text-green-600" />
          )}
          {badge.type === "purchasable" && !isEarned && (
            <Lock className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <CardTitle className="text-sm font-semibold">{badge.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
        
        {/* Progress for earnable badges */}
        {badge.type === "earnable" && !isEarned && memberStats && (
          <div className="space-y-2">
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-gray-500">
              {formatBadgeProgressText(badge, memberStats)} ({progressPercent}%)
            </p>
          </div>
        )}

        {/* Purchase button for purchasable badges */}
        {badge.type === "purchasable" && !isEarned && badge.price && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Cost:</span>
              <span className="font-semibold">{badge.price} pts</span>
            </div>
            <Button
              size="sm"
              className="w-full"
              disabled={!canAfford || !onPurchase}
              onClick={() => onPurchase?.(badge.id)}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Buy Badge
            </Button>
          </div>
        )}

        {isEarned && (
          <div className="flex items-center text-green-600 text-xs">
            <Trophy className="w-4 h-4 mr-1" />
            Earned!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ memberStats, onPurchaseBadge }) => {
  const earnedBadgeIds = memberStats.earnedBadges;
  const currentPoints = memberStats.totalPoints;

  const earnableBadges = EARNABLE_BADGES.map(badge => ({
    badge,
    isEarned: earnedBadgeIds.includes(badge.id),
    progress: getBadgeProgress(badge.id, memberStats)
  }));

  const purchasableBadges = PURCHASABLE_BADGES.map(badge => ({
    badge,
    isEarned: earnedBadgeIds.includes(badge.id),
    canAfford: currentPoints >= (badge.price || 0)
  }));

  // Sort earned badges first, then by progress
  const sortedEarnableBadges = earnableBadges.sort((a, b) => {
    if (a.isEarned && !b.isEarned) return -1;
    if (!a.isEarned && b.isEarned) return 1;
    if (!a.isEarned && !b.isEarned) return b.progress - a.progress;
    return 0;
  });

  const earnedCount = earnedBadgeIds.length;
  const totalBadges = EARNABLE_BADGES.length + PURCHASABLE_BADGES.length;

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Badge Collection</span>
            <Badge variant="secondary" className="text-sm">
              {earnedCount}/{totalBadges} Earned
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round((earnedCount / totalBadges) * 100)}%</span>
            </div>
            <Progress value={(earnedCount / totalBadges) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Earnable Badges */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
          Achievement Badges ({earnableBadges.filter(b => b.isEarned).length}/{EARNABLE_BADGES.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedEarnableBadges.map(({ badge, isEarned, progress }) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              isEarned={isEarned}
              progress={progress}
              memberStats={memberStats}
            />
          ))}
        </div>
      </div>

      {/* Purchasable Badges */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
          Premium Badges ({purchasableBadges.filter(b => b.isEarned).length}/{PURCHASABLE_BADGES.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {purchasableBadges.map(({ badge, isEarned, canAfford }) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              isEarned={isEarned}
              onPurchase={onPurchaseBadge}
              canAfford={canAfford}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
