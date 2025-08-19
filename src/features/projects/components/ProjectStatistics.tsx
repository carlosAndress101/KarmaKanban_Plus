import { useGetProjectAnalytics } from "@/features/projects/api/useGetProjectAnalytics";
import { useProjectPerformance } from "@/features/projects/hooks/useProjectPerformance";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskStatus } from "@/features/tasks/types";

function formatDuration(ms: number | null) {
  if (ms === null) return "N/A";
  const days = ms / (1000 * 60 * 60 * 24);
  if (days < 1) {
    const hours = ms / (1000 * 60 * 60);
    return `${hours.toFixed(1)} hours`;
  }
  return `${days.toFixed(1)} days`;
}

export function ProjectStatistics({
  projectId,
  workspaceId,
}: {
  projectId: string;
  workspaceId: string;
}) {
  // Fetch analytics (basic stats)
  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    error: errorAnalytics,
  } = useGetProjectAnalytics({ projectId });
  // Fetch performance (detailed stats)
  const {
    data: performance,
    isLoading: isLoadingPerformance,
    error: errorPerformance,
  } = useProjectPerformance(workspaceId);

  if (isLoadingAnalytics || isLoadingPerformance)
    return <Skeleton className="h-40 w-full" />;
  if (errorAnalytics || errorPerformance)
    return <div className="text-red-500">Error loading stats</div>;
  if (!analytics) return null;

  // Find the stats for this project
  const stat = performance?.find((s: any) => s.projectId === projectId);

  const difficultyBadge: Record<string, any> = {
    Facil: "Facil",
    Medio: "Medio",
    Dificil: "Dificil",
  };

  return (
    <Card className="p-6 shadow-lg border bg-card w-full mt-4">
      <h3 className="font-bold text-xl mb-4 text-primary flex items-center gap-2">
        <span className="inline-block w-2 h-6 bg-primary rounded-sm" />
        Project Statistics
      </h3>
      <div className="flex flex-wrap gap-4 mb-4">
        <Badge variant="secondary">
          Total Tasks: <span className="font-bold">{analytics.taskCount}</span>
        </Badge>
        <Badge variant={TaskStatus.DONE}>
          Completed:{" "}
          <span className="font-bold">{analytics.completedTaskCount}</span>
        </Badge>
        <Badge variant="outline">
          Incomplete:{" "}
          <span className="font-bold">{analytics.inCompleteTaskCount}</span>
        </Badge>
        <Badge variant="outline">
          Overdue:{" "}
          <span className="font-bold">{analytics.overDueTaskCount}</span>
        </Badge>
        <Badge variant="outline">
          Assigned to you:{" "}
          <span className="font-bold">{analytics.assignedTaskCount}</span>
        </Badge>
      </div>
      {stat && (
        <>
          <div className="flex flex-wrap gap-4 mb-4">
            <Badge variant="outline">
              Avg Time:{" "}
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
                    variant={difficultyBadge[type] || "outline"}
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
                    variant={difficultyBadge[type] || "outline"}
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
              {stat.memberStats.map((member: any) => (
                <div
                  key={member.name}
                  className="bg-muted border border-border rounded px-3 py-2 flex flex-col"
                >
                  <span className="font-bold text-primary">{member.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Total: {member.total} tasks
                  </span>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {Object.entries(member.byType).map(([type, count]) => (
                      <Badge
                        key={type}
                        variant={difficultyBadge[type] || "outline"}
                      >
                        {type}: {String(count)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
