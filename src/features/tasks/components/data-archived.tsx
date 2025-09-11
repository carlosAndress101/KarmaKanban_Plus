"use client";

import { MoreHorizontalIcon, ArchiveRestoreIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";

import { Task } from "../types";
import { TaskActions } from "./task-actions";

interface DataArchivedProps {
  data: Task[];
}

export const DataArchived = ({ data }: DataArchivedProps) => {
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
        <h3 className="text-lg font-medium">Archived Tasks ({data.length})</h3>
      </div>
      
      <DottedSeparator />
      
      <div className="space-y-3">
        {data.map((task) => (
          <Card key={task.id} className="shadow-sm">
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
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Project: {task.project.name}</span>
                {task.assignee && (
                  <span>
                    Assigned to: {task.assignee.name} {task.assignee.lastName}
                  </span>
                )}
                <span className="capitalize">Difficulty: {task.difficulty}</span>
                {task.dueDate && (
                  <span>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
