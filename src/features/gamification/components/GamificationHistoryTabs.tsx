import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getBadgeById } from "../constants/badges";
import { cn } from "@/lib/utils";

interface BadgeHistoryItem {
  id: string;
  name: string;
  earnedAt: string;
  // Optionally add badgeId if needed for lookup
}

interface TaskHistoryItem {
  id: string;
  name: string;
  difficulty: string;
  points: number;
  completedAt: string;
}

interface BuyHistoryItem {
  id: string;
  itemName: string;
  status: string;
  createdAt: string;
}

interface GamificationHistoryTabsProps {
  workspaceId: string;
  memberId?: string;
}

export const GamificationHistoryTabs: React.FC<
  GamificationHistoryTabsProps
> = ({ workspaceId, memberId }) => {
  const [tab, setTab] = useState("badges");
  const [badgeHistory, setBadgeHistory] = useState<BadgeHistoryItem[]>([]);
  const [taskHistory, setTaskHistory] = useState<TaskHistoryItem[]>([]);
  const [buyHistory, setBuyHistory] = useState<BuyHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (tab === "badges") {
      fetch(
        `/api/gamification/badges-history?workspaceId=${workspaceId}${
          memberId ? `&memberId=${memberId}` : ""
        }`
      )
        .then((res) => res.json())
        .then((data) => setBadgeHistory(data.data || []))
        .finally(() => setLoading(false));
    } else if (tab === "tasks") {
      fetch(
        `/api/gamification/tasks-history?workspaceId=${workspaceId}${
          memberId ? `&memberId=${memberId}` : ""
        }`
      )
        .then((res) => res.json())
        .then((data) => setTaskHistory(data.data || []))
        .finally(() => setLoading(false));
    } else if (tab === "buy") {
      fetch(`/api/store/redemptions?workspaceId=${workspaceId}`)
        .then((res) => res.json())
        .then((data) => {
          let items = data.data || [];
          if (memberId)
            items = items.filter((item: any) => item.requesterId === memberId);
          setBuyHistory(items);
        })
        .finally(() => setLoading(false));
    }
  }, [tab, workspaceId, memberId]);

  useEffect(() => {
    if (tab === "badges") {
      setLoading(true);
      fetch(
        `/api/gamification/badges-history?workspaceId=${workspaceId}${
          memberId ? `&memberId=${memberId}` : ""
        }`
      )
        .then((res) => res.json())
        .then((data) => setBadgeHistory(data.data || []))
        .finally(() => setLoading(false));
    }
  }, [tab, workspaceId, memberId]);

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Gamification History</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="buy">Buy</TabsTrigger>
          </TabsList>
          <TabsContent value="badges">
            {loading ? (
              <div>Loading...</div>
            ) : badgeHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No badges earned yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {badgeHistory.map((badge) => {
                  const badgeInfo = getBadgeById(badge.id);
                  const Icon = badgeInfo?.icon;
                  // Extract border color from badgeInfo.color (e.g., 'text-green-600 bg-green-50')
                  let borderColor = "border-gray-300";
                  if (badgeInfo?.color?.includes("green"))
                    borderColor = "border-green-500";
                  else if (badgeInfo?.color?.includes("blue"))
                    borderColor = "border-blue-500";
                  else if (badgeInfo?.color?.includes("purple"))
                    borderColor = "border-purple-500";
                  else if (badgeInfo?.color?.includes("yellow"))
                    borderColor = "border-yellow-500";
                  else if (badgeInfo?.color?.includes("orange"))
                    borderColor = "border-orange-500";
                  else if (badgeInfo?.color?.includes("rose"))
                    borderColor = "border-rose-500";
                  else if (badgeInfo?.color?.includes("amber"))
                    borderColor = "border-amber-500";
                  else if (badgeInfo?.color?.includes("violet"))
                    borderColor = "border-violet-500";
                  return (
                    <Card
                      key={badge.id}
                      className={cn(
                        "flex flex-col items-center p-4 border-2",
                        borderColor
                      )}
                    >
                      {Icon && (
                        <div
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                            badgeInfo.color
                          )}
                        >
                          <Icon className="w-7 h-7" />
                        </div>
                      )}
                      <CardTitle className="text-base font-semibold text-center mb-1">
                        {badge.name}
                      </CardTitle>
                      <div className="text-xs text-gray-500 mb-2">
                        {badgeInfo?.description}
                      </div>
                      <div className="text-xs text-gray-400 mb-2">
                        Earned: {new Date(badge.earnedAt).toLocaleString()}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks">
            {loading ? (
              <div>Loading...</div>
            ) : taskHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No tasks completed yet.
              </div>
            ) : (
              <>
                {/* Summary of tasks by difficulty */}
                {(() => {
                  const summary = taskHistory.reduce(
                    (acc, task) => {
                      const key =
                        task.difficulty === "Facil" ||
                        task.difficulty === "Easy"
                          ? "Easy"
                          : task.difficulty === "Medio" ||
                            task.difficulty === "Medium"
                          ? "Medium"
                          : task.difficulty === "Dificil" ||
                            task.difficulty === "Hard"
                          ? "Hard"
                          : "Other";
                      acc[key] = (acc[key] || 0) + 1;
                      return acc;
                    },
                    { Easy: 0, Medium: 0, Hard: 0, Other: 0 }
                  );
                  return (
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="px-3 py-1 rounded border-2 border-green-500 bg-green-50 text-green-700 text-xs font-semibold">
                        Easy: {summary.Easy}
                      </div>
                      <div className="px-3 py-1 rounded border-2 border-yellow-500 bg-yellow-50 text-yellow-700 text-xs font-semibold">
                        Medium: {summary.Medium}
                      </div>
                      <div className="px-3 py-1 rounded border-2 border-red-500 bg-red-50 text-red-700 text-xs font-semibold">
                        Hard: {summary.Hard}
                      </div>
                      {summary.Other > 0 && (
                        <div className="px-3 py-1 rounded border-2 border-gray-400 bg-gray-50 text-gray-700 text-xs font-semibold">
                          Other: {summary.Other}
                        </div>
                      )}
                    </div>
                  );
                })()}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {taskHistory.map((task) => {
                    let color = "bg-gray-100 text-gray-700";
                    let borderColor = "border-gray-300";
                    if (
                      task.difficulty === "Facil" ||
                      task.difficulty === "Easy"
                    ) {
                      color = "bg-green-100 text-green-700";
                      borderColor = "border-green-500";
                    } else if (
                      task.difficulty === "Medio" ||
                      task.difficulty === "Medium"
                    ) {
                      color = "bg-yellow-100 text-yellow-700";
                      borderColor = "border-yellow-500";
                    } else if (
                      task.difficulty === "Dificil" ||
                      task.difficulty === "Hard"
                    ) {
                      color = "bg-red-100 text-red-700";
                      borderColor = "border-red-500";
                    }
                    return (
                      <Card
                        key={task.id}
                        className={cn(
                          "flex flex-col p-4 border-2",
                          borderColor
                        )}
                      >
                        <CardTitle className="text-base font-semibold mb-1">
                          {task.name}
                        </CardTitle>
                        <div
                          className={cn(
                            "inline-block px-2 py-1 rounded text-xs font-medium mb-2 w-fit",
                            color
                          )}
                        >
                          {task.difficulty}
                        </div>
                        <div className="text-xs mb-1">
                          Points:{" "}
                          <span className="font-bold text-blue-700">
                            {task.points}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Completed:{" "}
                          {new Date(task.completedAt).toLocaleString()}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="buy">
            {loading ? (
              <div>Loading...</div>
            ) : buyHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No purchases yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {buyHistory.map((buy) => {
                  let color = "bg-gray-100 text-gray-700";
                  let borderColor = "border-gray-300";
                  if (buy.status === "approved") {
                    color = "bg-green-100 text-green-700";
                    borderColor = "border-green-500";
                  } else if (buy.status === "pending") {
                    color = "bg-yellow-100 text-yellow-700";
                    borderColor = "border-yellow-500";
                  } else if (buy.status === "rejected") {
                    color = "bg-red-100 text-red-700";
                    borderColor = "border-red-500";
                  }
                  return (
                    <Card
                      key={buy.id}
                      className={cn("flex flex-col p-4 border-2", borderColor)}
                    >
                      <CardTitle className="text-base font-semibold mb-1">
                        {buy.itemName}
                      </CardTitle>
                      <div
                        className={cn(
                          "inline-block px-2 py-1 rounded text-xs font-medium mb-2 w-fit",
                          color
                        )}
                      >
                        {buy.status.charAt(0).toUpperCase() +
                          buy.status.slice(1)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Date: {new Date(buy.createdAt).toLocaleString()}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
