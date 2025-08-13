"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lock, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge as BadgeType, EARNABLE_BADGES, PURCHASABLE_BADGES } from "../constants/badges";
import { MemberStats, getBadgeProgress, formatBadgeProgressText } from "../utils/badge-manager";

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberStats: MemberStats;
  onPurchaseBadge?: (badgeId: string) => void;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({ 
  isOpen, 
  onClose, 
  memberStats, 
  onPurchaseBadge 
}) => {
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  const [activeTab, setActiveTab] = useState<'earnable' | 'purchasable'>('earnable');

  const earnedBadgeIds = memberStats.earnedBadges;

  const renderBadgeCard = (badge: BadgeType, isEarned: boolean, progress?: number) => {
    const IconComponent = badge.icon;
    const progressPercent = progress ? Math.round(progress * 100) : 0;

    return (
      <div
        key={badge.id}
        className={`relative p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
          isEarned 
            ? 'border-green-300 bg-green-50 hover:border-green-400' 
            : 'border-gray-200 bg-white hover:border-gray-300'
        } ${selectedBadge?.id === badge.id ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => setSelectedBadge(selectedBadge?.id === badge.id ? null : badge)}
      >
        {/* Badge Icon */}
        <div className="flex items-center justify-center mb-3">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isEarned ? badge.color : 'bg-gray-100 text-gray-400'
          } ${!isEarned ? 'relative' : ''}`}>
            {!isEarned && (
              <div className="absolute inset-0 bg-gray-400 bg-opacity-50 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
            )}
            <IconComponent className="w-8 h-8" />
          </div>
        </div>

        {/* Badge Name */}
        <h3 className={`font-semibold text-center mb-2 ${
          isEarned ? 'text-gray-900' : 'text-gray-500'
        }`}>
          {badge.name}
        </h3>

        {/* Earned Status */}
        {isEarned && (
          <div className="flex items-center justify-center mb-2">
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
              <Trophy className="w-3 h-3 mr-1" />
              Earned!
            </Badge>
          </div>
        )}

        {/* Progress for Earnable Badges */}
        {badge.type === 'earnable' && !isEarned && progress !== undefined && (
          <div className="space-y-2">
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-gray-500 text-center">
              {progressPercent}% complete
            </p>
          </div>
        )}

        {/* Price for Purchasable Badges */}
        {badge.type === 'purchasable' && !isEarned && badge.price && (
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              {badge.price} points
            </p>
            <Button 
              size="sm" 
              className="w-full"
              disabled={memberStats.totalPoints < badge.price}
              onClick={(e) => {
                e.stopPropagation();
                onPurchaseBadge?.(badge.id);
              }}
            >
              Purchase
            </Button>
          </div>
        )}

        {/* Click indicator */}
        <p className="text-xs text-gray-400 text-center mt-2">
          Click for details
        </p>
      </div>
    );
  };

  const renderBadgeDetails = () => {
    if (!selectedBadge) return null;

    const isEarned = earnedBadgeIds.includes(selectedBadge.id);
    const progress = selectedBadge.type === 'earnable' ? getBadgeProgress(selectedBadge.id, memberStats) : undefined;
    const IconComponent = selectedBadge.icon;

    return (
      <div className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-start space-x-4">
          {/* Badge Icon */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            isEarned ? selectedBadge.color : 'bg-gray-100 text-gray-400 relative'
          }`}>
            {!isEarned && (
              <div className="absolute inset-0 bg-gray-400 bg-opacity-50 rounded-full flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
            )}
            <IconComponent className="w-6 h-6" />
          </div>

          {/* Badge Details */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{selectedBadge.name}</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedBadge(null)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-gray-700 mb-3">{selectedBadge.description}</p>
            
            {/* Status */}
            {isEarned ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800 mb-3">
                <Trophy className="w-3 h-3 mr-1" />
                Earned!
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-600 mb-3">
                <Lock className="w-3 h-3 mr-1" />
                Not yet earned
              </Badge>
            )}

            {/* Progress Details */}
            {selectedBadge.type === 'earnable' && !isEarned && progress !== undefined && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress:</span>
                  <span className="font-medium">{Math.round(progress * 100)}%</span>
                </div>
                <Progress value={progress * 100} className="h-2" />
                <p className="text-sm text-gray-600">
                  {formatBadgeProgressText(selectedBadge, memberStats)}
                </p>
              </div>
            )}

            {/* Purchase Info */}
            {selectedBadge.type === 'purchasable' && !isEarned && selectedBadge.price && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="font-semibold">{selectedBadge.price} points</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Your points:</span>
                  <span className={`font-semibold ${
                    memberStats.totalPoints >= selectedBadge.price ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {memberStats.totalPoints} points
                  </span>
                </div>
                {memberStats.totalPoints >= selectedBadge.price ? (
                  <Button 
                    className="w-full"
                    onClick={() => onPurchaseBadge?.(selectedBadge.id)}
                  >
                    Purchase Badge
                  </Button>
                ) : (
                  <p className="text-sm text-red-600 text-center">
                    Not enough points to purchase
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Badge Collection</DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'earnable'
                ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('earnable')}
          >
            Achievement Badges ({EARNABLE_BADGES.filter(b => earnedBadgeIds.includes(b.id)).length}/{EARNABLE_BADGES.length})
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'purchasable'
                ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('purchasable')}
          >
            Premium Badges ({PURCHASABLE_BADGES.filter(b => earnedBadgeIds.includes(b.id)).length}/{PURCHASABLE_BADGES.length})
          </button>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {activeTab === 'earnable' 
            ? EARNABLE_BADGES.map(badge => {
                const isEarned = earnedBadgeIds.includes(badge.id);
                const progress = getBadgeProgress(badge.id, memberStats);
                return renderBadgeCard(badge, isEarned, progress);
              })
            : PURCHASABLE_BADGES.map(badge => {
                const isEarned = earnedBadgeIds.includes(badge.id);
                return renderBadgeCard(badge, isEarned);
              })
          }
        </div>

        {/* Selected Badge Details */}
        {renderBadgeDetails()}
      </DialogContent>
    </Dialog>
  );
};
