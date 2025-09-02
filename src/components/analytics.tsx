import { ProjectAnalyticsResponseType } from "@/features/projects/api/useGetProjectAnalytics";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AnalyticsCard } from "./analytics-card";
import { DottedSeparator } from "./dotted-separator";

const getVariant = (difference: number) => {
  if (difference > 0) return "up";
  if (difference < 0) return "down";
  return "neutral";
};

export const Analytics = ({ data }: ProjectAnalyticsResponseType) => {
  return (
    <ScrollArea className="border rounded-lg w-full whitespace-nowrap shrink-0">
      <ScrollBar orientation="horizontal" />
      <div className="w-full flex flex-row">
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Total tasks"
            value={data.taskCount}
            variant={getVariant(data.taskCount)}
            increaseValue={data.taskCount}
          />
          <DottedSeparator direction="vertical" />
        </div>

        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Assigned tasks"
            value={data.assignedTaskCount}
            variant={getVariant(data.assignedTaskCount)}
            increaseValue={data.assignedTaskCount}
          />
          <DottedSeparator direction="vertical" />
        </div>

        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Completed tasks"
            value={data.completedTaskCount}
            variant={getVariant(data.completedTaskCount)}
            increaseValue={data.completedTaskCount}
          />
          <DottedSeparator direction="vertical" />
        </div>

        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Incomplete tasks"
            value={data.inCompleteTaskCount}
            variant={getVariant(data.inCompleteTaskDifference)}
            increaseValue={data.inCompleteTaskCount}
          />
          <DottedSeparator direction="vertical" />
        </div>

        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Overdue tasks"
            value={data.overDueTaskCount}
            variant={getVariant(data.overDueTaskDifference)}
            increaseValue={data.overDueTaskDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>
      </div>
    </ScrollArea>
  );
};
