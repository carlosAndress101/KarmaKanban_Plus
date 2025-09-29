"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Edit2Icon,
  TrophyIcon,
  Target,
  Users,
  Code,
  Palette,
  Settings,
  Shield,
} from "lucide-react";
import { BadgeCarousel } from "./badge-carousel";
import { BadgeModal } from "./badge-modal";
import { MemberStats } from "../utils/badge-manager";

// Development team quality icons with meanings
const TEAM_QUALITY_ICONS = [
  {
    id: "leadership",
    icon: Shield,
    label: "Leadership",
    description: "Natural leader and mentor",
  },
  {
    id: "creativity",
    icon: Palette,
    label: "Creativity",
    description: "Innovative problem solver",
  },
  {
    id: "technical",
    icon: Code,
    label: "Technical",
    description: "Strong technical skills",
  },
  {
    id: "collaboration",
    icon: Users,
    label: "Collaboration",
    description: "Excellent team player",
  },
  {
    id: "focus",
    icon: Target,
    label: "Focus",
    description: "Goal-oriented achiever",
  },
  {
    id: "adaptability",
    icon: Settings,
    label: "Adaptability",
    description: "Flexible and versatile",
  },
];

const GAMIFICATION_ROLES = [
  "Developer",
  "Designer",
  "Project Manager",
  "Team Lead",
];

interface GamificationProfileProps {
  user: {
    id: string;
    name: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  gamificationData: {
    gamificationRole?: string;
    points: number;
    selectedIcons: string[];
    aboutMe?: string;
    earnedBadges?: string[];
    totalTasksCompleted?: number;
    tasksCompletedByDifficulty?: {
      Easy: number;
      Medium: number;
      Hard: number;
    };
  };
  onUpdate: (data: {
    gamificationRole?: string;
    selectedIcons: string[];
    aboutMe?: string;
  }) => void;
}

export const GamificationProfile = ({
  user,
  gamificationData,
  onUpdate,
}: GamificationProfileProps) => {
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState(gamificationData.aboutMe || "");
  const [selectedRole, setSelectedRole] = useState(
    gamificationData.gamificationRole || ""
  );
  const [selectedIcons, setSelectedIcons] = useState<string[]>(
    gamificationData.selectedIcons || []
  );
  const [isIconDialogOpen, setIsIconDialogOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setAboutText(gamificationData.aboutMe || "");
    setSelectedRole(gamificationData.gamificationRole || "");
    setSelectedIcons(gamificationData.selectedIcons || []);
  }, [gamificationData]);

  const handleSaveAbout = () => {
    onUpdate({
      gamificationRole: selectedRole,
      selectedIcons,
      aboutMe: aboutText,
    });
    setIsEditingAbout(false);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    onUpdate({
      gamificationRole: role,
      selectedIcons,
      aboutMe: aboutText,
    });
  };

  const handleIconToggle = (iconId: string) => {
    let newSelectedIcons: string[];

    if (selectedIcons.includes(iconId)) {
      newSelectedIcons = selectedIcons.filter((id) => id !== iconId);
    } else if (selectedIcons.length < 3) {
      newSelectedIcons = [...selectedIcons, iconId];
    } else {
      // Replace the first icon if already at limit
      newSelectedIcons = [selectedIcons[1], selectedIcons[2], iconId];
    }

    setSelectedIcons(newSelectedIcons);
  };

  const handleSaveIcons = () => {
    onUpdate({
      gamificationRole: selectedRole,
      selectedIcons,
      aboutMe: aboutText,
    });
    setIsIconDialogOpen(false);
  };

  const getSelectedIconComponents = () => {
    return selectedIcons.map((iconId) => {
      const iconData = TEAM_QUALITY_ICONS.find((icon) => icon.id === iconId);
      if (!iconData) return null;
      const IconComponent = iconData.icon;
      return (
        <div
          key={iconId}
          className="flex flex-col items-center justify-between h-16 relative group"
        >
          <div
            className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center relative cursor-pointer"
            onClick={() => handleRemoveIcon(iconId)}
          >
            <IconComponent className="w-5 h-5 text-blue-600" />
            {/* Remove indicator on hover */}
            <div className="absolute inset-0 bg-red-500 bg-opacity-80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-bold">×</span>
            </div>
          </div>
          <span className="text-xs text-gray-600 text-center">
            {iconData.label}
          </span>
        </div>
      );
    });
  };

  const handleRemoveIcon = (iconId: string) => {
    const newSelectedIcons = selectedIcons.filter((id) => id !== iconId);
    setSelectedIcons(newSelectedIcons);
    onUpdate({
      gamificationRole: selectedRole,
      selectedIcons: newSelectedIcons,
      aboutMe: aboutText,
    });
  };

  // Create member stats for badge system
  const memberStats: MemberStats = {
    totalTasksCompleted: gamificationData.totalTasksCompleted || 0,
    totalPoints: gamificationData.points,
    tasksCompletedByDifficulty: gamificationData.tasksCompletedByDifficulty || {
      Easy: 0,
      Medium: 0,
      Hard: 0,
    },
    tasksCompletedToday: 0, // TODO: Calculate from today's completed tasks
    currentStreak: 0, // TODO: Calculate streak
    collaborativeTasks: 0, // TODO: Calculate collaborative tasks
    earnedBadges: gamificationData.earnedBadges || [],
  };

  return (
    <>
      <div className="flex gap-6">
        {/* Main Profile Section */}
        <Card className="flex-1">
          <CardContent className="space-y-6 pt-6">
            {/* Avatar and User Info Section */}
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <Avatar className="w-32 h-32">
                <AvatarImage
                  src={user.avatar}
                  alt={`${user.name} ${user.lastName}`}
                />
                <AvatarFallback className="text-2xl">
                  {user.name.charAt(0)}
                  {user.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* User Information */}
              <div className="flex-1 space-y-3">
                {/* Name */}
                <h2 className="text-2xl font-bold">
                  {user.name} {user.lastName}
                </h2>

                {/* Role Selection */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Role:</span>
                  <Select value={selectedRole} onValueChange={handleRoleChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {GAMIFICATION_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Icons and Points */}
                <div className="flex items-center space-x-6">
                  {/* Selected Icons */}
                  <div className="flex items-center space-x-2 relative group">
                    <span className="text-sm text-gray-600">Qualities:</span>
                    <div className="flex space-x-2">
                      {getSelectedIconComponents()}
                      {selectedIcons.length < 3 && (
                        <Dialog
                          open={isIconDialogOpen}
                          onOpenChange={setIsIconDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-10 h-10 rounded-full cursor-pointer"
                            >
                              +
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                Choose Your Team Qualities (Select up to 3)
                              </DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
                              {TEAM_QUALITY_ICONS.map((iconData) => {
                                const IconComponent = iconData.icon;
                                const isSelected = selectedIcons.includes(
                                  iconData.id
                                );
                                return (
                                  <div
                                    key={iconData.id}
                                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                      isSelected
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:border-gray-300"
                                    }`}
                                    onClick={() =>
                                      handleIconToggle(iconData.id)
                                    }
                                  >
                                    <div className="flex flex-col items-center space-y-2">
                                      <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                          isSelected
                                            ? "bg-blue-100"
                                            : "bg-gray-100"
                                        }`}
                                      >
                                        <IconComponent
                                          className={`w-6 h-6 ${
                                            isSelected
                                              ? "text-blue-600"
                                              : "text-gray-600"
                                          }`}
                                        />
                                      </div>
                                      <h3 className="font-medium text-sm">
                                        {iconData.label}
                                      </h3>
                                      <p className="text-xs text-gray-600 text-center">
                                        {iconData.description}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsIconDialogOpen(false)}
                                className="cursor-pointer"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleSaveIcons}
                                className="cursor-pointer"
                              >
                                Save Selection
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                    {/* Tooltip on hover */}
                    {selectedIcons.length > 0 && (
                      <div className="absolute -bottom-6 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        Click on qualities to remove them
                      </div>
                    )}
                  </div>

                  {/* Points Display - Made larger */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Points:</span>
                    <Badge
                      variant="secondary"
                      className="flex items-center space-x-2 px-4 py-2 text-base"
                    >
                      <TrophyIcon className="w-5 h-5 text-yellow-600" />
                      <span className="font-bold text-lg">
                        {gamificationData.points.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-600">pts</span>
                    </Badge>
                  </div>

                  {/* Debug Info - Temporary */}
                  <div className="text-xs text-gray-400 mt-2">
                    Tasks: {gamificationData.totalTasksCompleted || 0} | Badges:{" "}
                    {gamificationData.earnedBadges?.length || 0}
                  </div>
                </div>

                {/* Email */}
                <div className="text-gray-600">
                  <span className="text-sm">Email: </span>
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">ABOUT</h3>
                {!isEditingAbout && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingAbout(true)}
                    className="text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    <Edit2Icon className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {isEditingAbout ? (
                <div className="space-y-3">
                  <Textarea
                    value={aboutText}
                    onChange={(e) => setAboutText(e.target.value)}
                    placeholder="Tell us about yourself..."
                    maxLength={1000}
                    className="min-h-[120px]"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {aboutText.length}/1000 characters
                    </span>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAboutText(gamificationData.aboutMe || "");
                          setIsEditingAbout(false);
                        }}
                        className="cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveAbout}
                        className="cursor-pointer"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">
                    {gamificationData.aboutMe ||
                      "No description added yet. Click the edit button to add information about yourself."}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badge Carousel truly below the profile, full page width */}
      <div className="w-full mt-8 mb-4 px-0">
        <div className="w-full">
          <BadgeCarousel
            earnedBadgeIds={memberStats.earnedBadges}
            onViewAllBadges={() => setIsBadgeModalOpen(true)}
          />
        </div>
      </div>

      {/* Badge Modal */}
      <BadgeModal
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
        memberStats={memberStats}
      />
    </>
  );
};
