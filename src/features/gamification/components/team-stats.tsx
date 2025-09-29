"use client";

import { useGetTeamStats } from "../api/useGetTeamStats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Users,
  Trophy,
  Target,
  TrendingUp,
  Award,
  Search,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EARNABLE_BADGES } from "../constants/badges";
import { useState } from "react";

interface TeamStatsProps {
  workspaceId: string;
}

export const TeamStats = ({ workspaceId }: TeamStatsProps) => {
  const {
    data: teamStats,
    isLoading,
    error,
  } = useGetTeamStats({ workspaceId });

  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const togglePopover = (memberId: string) => {
    setOpenPopovers((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  // Filter team stats based on search term
  const filteredTeamStats =
    teamStats?.filter(
      (member) =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.gamificationRole
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    ) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !teamStats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Could not load team statistics.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate team totals
  const totalTeamPoints = teamStats.reduce(
    (sum, member) => sum + Number(member.totalPoints || 0),
    0
  );
  const totalHistoricalTeamPoints = teamStats.reduce(
    (sum, member) => sum + Number(member.totalHistoricalPoints || 0),
    0
  );
  const totalTeamTasks = teamStats.reduce(
    (sum, member) => sum + Number(member.totalTasksCompleted || 0),
    0
  );

  // Calculate totals by difficulty across all members
  const teamTasksByDifficulty = teamStats.reduce(
    (totals, member) => ({
      Easy: totals.Easy + Number(member.tasksCompletedByDifficulty?.Easy || 0),
      Medium:
        totals.Medium + Number(member.tasksCompletedByDifficulty?.Medium || 0),
      Hard: totals.Hard + Number(member.tasksCompletedByDifficulty?.Hard || 0),
    }),
    { Easy: 0, Medium: 0, Hard: 0 }
  );

  const teamPointsByDifficulty = teamStats.reduce(
    (totals, member) => ({
      Easy: totals.Easy + Number(member.pointsByDifficulty?.Easy || 0),
      Medium: totals.Medium + Number(member.pointsByDifficulty?.Medium || 0),
      Hard: totals.Hard + Number(member.pointsByDifficulty?.Hard || 0),
    }),
    { Easy: 0, Medium: 0, Hard: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card className="border-0 bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl">Team Overview</CardTitle>
          </div>
          <CardDescription>General team performance statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {teamStats.length}
              </div>
              <div className="text-sm text-gray-600">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {totalTeamPoints.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Current Available Points
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {totalHistoricalTeamPoints.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Points Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {totalTeamTasks.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {totalTeamTasks > 0
                  ? Math.round(
                      totalHistoricalTeamPoints / totalTeamTasks
                    ).toLocaleString()
                  : "0"}
              </div>
              <div className="text-sm text-gray-600">Avg. Pts/Task</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks and Points by Difficulty */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Tasks by Difficulty</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Easy
                  </Badge>
                  <span className="text-sm text-gray-600">10 pts each</span>
                </div>
                <span className="font-semibold">
                  {teamTasksByDifficulty.Easy.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    Medium
                  </Badge>
                  <span className="text-sm text-gray-600">20 pts each</span>
                </div>
                <span className="font-semibold">
                  {teamTasksByDifficulty.Medium.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-red-800"
                  >
                    Hard
                  </Badge>
                  <span className="text-sm text-gray-600">30 pts each</span>
                </div>
                <span className="font-semibold">
                  {teamTasksByDifficulty.Hard.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-lg">Points by Difficulty</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Easy
                  </Badge>
                </div>
                <span className="font-semibold text-green-600">
                  {teamPointsByDifficulty.Easy.toLocaleString()} pts
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    Medium
                  </Badge>
                </div>
                <span className="font-semibold text-yellow-600">
                  {teamPointsByDifficulty.Medium.toLocaleString()} pts
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-red-800"
                  >
                    Hard
                  </Badge>
                </div>
                <span className="font-semibold text-red-600">
                  {teamPointsByDifficulty.Hard.toLocaleString()} pts
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Team Member Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Member Statistics</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search member..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 w-64"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <CardDescription>
            Points breakdown by task difficulty for each team member{" "}
            {searchTerm &&
              `(${filteredTeamStats.length} of ${
                teamStats?.length || 0
              } members)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTeamStats
              .sort((a, b) => b.totalPoints - a.totalPoints) // Sort by total points descending
              .map((member) => (
                <div
                  key={member.memberId}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {member.name}
                      </h4>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      {member.gamificationRole && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {member.gamificationRole}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {member.totalPoints.toLocaleString()} pts
                      </div>
                      <div className="text-sm text-gray-600">Available</div>
                      <div className="text-sm font-semibold text-emerald-600">
                        {member.totalHistoricalPoints.toLocaleString()} pts
                      </div>
                      <div className="text-sm text-gray-600">Total Earned</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {member.totalTasksCompleted} tasks completed
                      </div>
                    </div>
                  </div>

                  {/* Points and tasks breakdown by difficulty */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Easy
                        </Badge>
                        <div className="text-right">
                          <div className="font-semibold text-green-700">
                            {member.pointsByDifficulty.Easy} pts
                          </div>
                          <div className="text-xs text-green-600">
                            {member.tasksCompletedByDifficulty.Easy} tasks
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                          Medium
                        </Badge>
                        <div className="text-right">
                          <div className="font-semibold text-yellow-700">
                            {member.pointsByDifficulty.Medium} pts
                          </div>
                          <div className="text-xs text-yellow-600">
                            {member.tasksCompletedByDifficulty.Medium} tasks
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          Hard
                        </Badge>
                        <div className="text-right">
                          <div className="font-semibold text-red-700">
                            {member.pointsByDifficulty.Hard} pts
                          </div>
                          <div className="text-xs text-red-600">
                            {member.tasksCompletedByDifficulty.Hard} tasks
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Member Badges */}
                  {member.earnedBadges && member.earnedBadges.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Badges ({member.earnedBadges.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {member.earnedBadges.slice(0, 6).map((badgeId) => {
                          const badge = EARNABLE_BADGES.find(
                            (b) => b.id === badgeId
                          );
                          if (!badge) return null;

                          return (
                            <TooltipProvider key={badgeId}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center space-x-1 bg-yellow-50 text-yellow-800 px-2 py-1 rounded-full text-xs border border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300 transition-colors cursor-help">
                                    <badge.icon className="h-3 w-3" />
                                    <span className="font-medium">
                                      {badge.name}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs p-3 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-lg">
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <badge.icon className="h-5 w-5 text-yellow-600" />
                                      <span className="font-semibold text-yellow-900">
                                        {badge.name}
                                      </span>
                                    </div>
                                    <p className="text-sm text-yellow-800 leading-relaxed">
                                      {badge.description}
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                        {member.earnedBadges.length > 6 && (
                          <Popover
                            open={openPopovers[member.memberId] || false}
                            onOpenChange={() => togglePopover(member.memberId)}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-xs"
                              >
                                +{member.earnedBadges.length - 6} more
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4">
                              <div className="space-y-3">
                                <h4 className="font-medium text-sm">
                                  All badges of {member.name}
                                </h4>
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                  {member.earnedBadges.map((badgeId) => {
                                    const badge = EARNABLE_BADGES.find(
                                      (b) => b.id === badgeId
                                    );
                                    if (!badge) return null;

                                    return (
                                      <TooltipProvider key={badgeId}>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className="flex items-center space-x-2 p-2 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300 transition-colors cursor-help">
                                              <badge.icon className="h-4 w-4 flex-shrink-0" />
                                              <div className="min-w-0">
                                                <p className="font-medium text-xs truncate">
                                                  {badge.name}
                                                </p>
                                                <p className="text-xs text-yellow-600 truncate">
                                                  {badge.description}
                                                </p>
                                              </div>
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent className="max-w-xs p-3 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-lg">
                                            <div className="space-y-2">
                                              <div className="flex items-center space-x-2">
                                                <badge.icon className="h-5 w-5 text-yellow-600" />
                                                <span className="font-semibold text-yellow-900">
                                                  {badge.name}
                                                </span>
                                              </div>
                                              <p className="text-sm text-yellow-800 leading-relaxed">
                                                {badge.description}
                                              </p>
                                            </div>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    );
                                  })}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

            {filteredTeamStats.length === 0 &&
              teamStats &&
              teamStats.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No members found</p>
                  <p className="text-sm">
                    Try a different search term or{" "}
                    <Button
                      variant="link"
                      onClick={() => setSearchTerm("")}
                      className="p-0 h-auto text-blue-600 underline"
                    >
                      clear the filter
                    </Button>
                  </p>
                </div>
              )}

            {teamStats && teamStats.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No team members yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
