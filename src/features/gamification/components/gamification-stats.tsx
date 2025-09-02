import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface GamificationStatsProps {
  totalTasksCompleted: number;
  tasksCompletedByDifficulty: { Easy: number; Medium: number; Hard: number };
  tasksCompletedToday: number;
  currentStreak: number;
  averageCompletionTime?: number; // in seconds
  averageCompletionTimeByDifficulty?: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
}

export const GamificationStats: React.FC<GamificationStatsProps> = ({
  totalTasksCompleted,
  tasksCompletedByDifficulty,
  tasksCompletedToday,
  currentStreak,
  averageCompletionTime,
  averageCompletionTimeByDifficulty,
}) => {
  function formatDuration(seconds?: number) {
    if (!seconds || isNaN(seconds)) return "-";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }
  // ...existing code...

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch justify-center h-full">
      {/* Left Card: Task Completion Statistics */}
      <Card className="flex-[2.3] flex flex-col min-w-[320px]">
        <CardHeader>
          <CardTitle>Task Completion Statistics</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Total Tasks Completed</div>
              <div className="text-2xl font-bold">{totalTasksCompleted}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Tasks Completed Today</div>
              <div className="text-2xl font-bold">{tasksCompletedToday}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Current Streak (days)</div>
              <div className="text-2xl font-bold">{currentStreak}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Avg. Completion Time</div>
              <div className="text-2xl font-bold">
                {formatDuration(averageCompletionTime)}
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="text-sm text-gray-500 mb-2">By Difficulty</div>
            <div className="flex gap-4 mb-4">
              <div className="px-3 py-1 rounded border-2 border-green-500 bg-green-50 text-green-700 text-xs font-semibold">
                Easy: {tasksCompletedByDifficulty.Easy}
              </div>
              <div className="px-3 py-1 rounded border-2 border-yellow-500 bg-yellow-50 text-yellow-700 text-xs font-semibold">
                Medium: {tasksCompletedByDifficulty.Medium}
              </div>
              <div className="px-3 py-1 rounded border-2 border-red-500 bg-red-50 text-red-700 text-xs font-semibold">
                Hard: {tasksCompletedByDifficulty.Hard}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Right Card: Chart and Average Completion Time by Difficulty */}
      <Card className="flex-[0.5] flex flex-col min-w-[320px]">
        <CardHeader>
          <CardTitle>Average Completion Time by Difficulty</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Pie chart removed. Only badges below remain. */}
          <div className="flex flex-col gap-2 items-center w-full">
            <div className="px-3 py-2 rounded border-2 border-green-500 bg-green-50 text-green-700 text-xs font-semibold flex flex-col items-center w-full">
              <span>Easy</span>
              <span className="text-base font-bold">
                {formatDuration(averageCompletionTimeByDifficulty?.Easy)}
              </span>
            </div>
            <div className="px-3 py-2 rounded border-2 border-yellow-500 bg-yellow-50 text-yellow-700 text-xs font-semibold flex flex-col items-center w-full">
              <span>Medium</span>
              <span className="text-base font-bold">
                {formatDuration(averageCompletionTimeByDifficulty?.Medium)}
              </span>
            </div>
            <div className="px-3 py-2 rounded border-2 border-red-500 bg-red-50 text-red-700 text-xs font-semibold flex flex-col items-center w-full">
              <span>Hard</span>
              <span className="text-base font-bold">
                {formatDuration(averageCompletionTimeByDifficulty?.Hard)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
