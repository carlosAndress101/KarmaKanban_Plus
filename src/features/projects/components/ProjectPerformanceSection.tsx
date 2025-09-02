import { useProjectPerformance } from "@/features/projects/hooks/useProjectPerformance";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskStatus } from "@/features/tasks/types";
import { Skeleton } from "@/components/ui/skeleton";

function formatDuration(ms: number | null) {
  if (ms === null) return "N/A";
  const days = ms / (1000 * 60 * 60 * 24);
  if (days < 1) {
    const hours = ms / (1000 * 60 * 60);
    return `${hours.toFixed(1)} hours`;
  }
  return `${days.toFixed(1)} days`;
}

export default function ProjectPerformanceSection() {
  const workspaceId = useWorkspaceId();
  const { data, isLoading, error } = useProjectPerformance(workspaceId);

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (error) return <div className="text-red-500">Error loading stats</div>;
  if (!data) return null;

  // Difficulty color mapping for Badge
  const difficultyBadge: Record<string, string> = {
    Easy: "Easy",
    Medium: "Medium",
    Hard: "Hard",
  };

  return (
    <section className="w-full">
      <h2 className="text-3xl font-extrabold text-primary mb-2 text-center">
        Team Performance
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-full">
        {data.map(
          (stat: {
            projectId: string;
            projectName: string;
            totalTasks: number;
            completedCount: number;
            avgCompletionTime: number | null;
            avgCompletionTimeByType: Record<string, number | null>;
            completedCountByType: Record<string, number>;
            memberStats: Array<{
              name: string;
              total: number;
              byType: Record<string, number>;
            }>;
          }) => (
            <Card
              key={stat.projectId}
              className="p-6 shadow-lg border bg-card w-full"
            >
              <h3 className="font-bold text-xl mb-4 text-primary flex items-center gap-2">
                <span className="inline-block w-2 h-6 bg-primary rounded-sm" />
                {stat.projectName}
              </h3>
              <div className="flex flex-wrap gap-4 mb-4">
                <Badge variant="secondary">
                  Total Tasks:{" "}
                  <span className="font-bold">{stat.totalTasks}</span>
                </Badge>
                <Badge variant={TaskStatus.DONE}>
                  Completed:{" "}
                  <span className="font-bold">{stat.completedCount}</span>
                </Badge>
                <Badge variant="outline">
                  Avg Completion Time:{" "}
                  <span className="font-bold">
                    {formatDuration(stat.avgCompletionTime)}
                  </span>
                </Badge>
              </div>
              <div className="mb-4">
                <div className="font-semibold text-primary mb-1">
                  Avg Completion Time by Type
                </div>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(stat.avgCompletionTimeByType).map(
                    ([type, avg]) => (
                      <Badge
                        key={type}
                        variant={
                          ["Easy", "Medium", "Hard"].includes(
                            difficultyBadge[type]
                          )
                            ? (difficultyBadge[type] as
                                | "Easy"
                                | "Medium"
                                | "Hard")
                            : "outline"
                        }
                      >
                        {type}: {formatDuration(avg as number | null)}
                      </Badge>
                    )
                  )}
                </div>
              </div>
              <div className="mb-4">
                <div className="font-semibold text-primary mb-1">
                  Completed Tasks by Type
                </div>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(stat.completedCountByType).map(
                    ([type, count]) => (
                      <Badge
                        key={type}
                        variant={
                          ["Easy", "Medium", "Hard"].includes(
                            difficultyBadge[type]
                          )
                            ? (difficultyBadge[type] as
                                | "Easy"
                                | "Medium"
                                | "Hard")
                            : "outline"
                        }
                      >
                        {type}: {String(count)}
                      </Badge>
                    )
                  )}
                </div>
              </div>
              <div>
                <div className="font-semibold text-primary mb-2">
                  Completions by Member
                </div>
                <div className="space-y-2">
                  {stat.memberStats.map(
                    (member: {
                      name: string;
                      total: number;
                      byType: Record<string, number>;
                    }) => (
                      <div
                        key={member.name}
                        className="bg-muted border border-border rounded px-3 py-2 flex flex-col"
                      >
                        <span className="font-bold text-primary">
                          {member.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Total: {member.total} tasks
                        </span>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {Object.entries(member.byType).map(
                            ([type, count]) => (
                              <Badge
                                key={type}
                                variant={
                                  ["Easy", "Medium", "Hard"].includes(
                                    difficultyBadge[type]
                                  )
                                    ? (difficultyBadge[type] as
                                        | "Easy"
                                        | "Medium"
                                        | "Hard")
                                    : "outline"
                                }
                              >
                                {type}: {String(count)}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </Card>
          )
        )}
      </div>
    </section>
  );
}
