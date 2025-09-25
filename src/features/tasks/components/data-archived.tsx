"use client";

import { useState, useCallback, useEffect } from "react";
import { MoreHorizontalIcon, ArchiveRestoreIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";

import { Task } from "../types";
import { TaskActions } from "./task-actions";
import { ArchivedFilters } from "./archived-filters";

interface DataArchivedProps {
  data: Task[];
}

export const DataArchived = ({ data }: DataArchivedProps) => {
  const [filteredData, setFilteredData] = useState<Task[]>(data);

  const handleFilteredData = useCallback((filtered: Task[]) => {
    setFilteredData(filtered);
  }, []);

  // Update filtered data when data changes
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
        <ArchiveRestoreIcon className="size-8 mb-2" />
        <p className="text-sm">No archived tasks found</p>
        <p className="text-xs mt-1">Tasks you archive will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Archived Tasks ({filteredData.length}
          {data.length !== filteredData.length ? ` of ${data.length}` : ""})
        </h3>
      </div>

      <DottedSeparator />

      {/* Filters Section */}
      <ArchivedFilters
        data={data}
        onFilteredData={handleFilteredData}
        className="bg-muted/30 p-4 rounded-lg border border-muted"
      />

      <DottedSeparator />

      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
          <ArchiveRestoreIcon className="size-6 mb-2" />
          <p className="text-sm">No tasks match your search criteria</p>
          <p className="text-xs mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredData.map((task) => (
            <Card
              key={task.id}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-medium line-clamp-1">
                      {task.name}
                    </CardTitle>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <TaskActions
                    id={task.id}
                    projectId={task.project.id}
                    archived={true}
                  >
                    <Button variant="ghost" size="sm">
                      <MoreHorizontalIcon className="size-4" />
                    </Button>
                  </TaskActions>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <span className="bg-muted/50 px-2 py-1 rounded text-xs">
                    Project: {task.project.name}
                  </span>
                  {task.assignee ? (
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                      Assigned to: {task.assignee.name} {task.assignee.lastName}
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      Unassigned
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      task.difficulty === "Easy"
                        ? "bg-green-50 text-green-700"
                        : task.difficulty === "Medium"
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {task.difficulty}
                  </span>
                  {task.dueDate && (
                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
