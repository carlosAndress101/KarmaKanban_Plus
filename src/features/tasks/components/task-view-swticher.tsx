"use client";

import { useCallback } from "react";
import { useQueryState } from "nuqs";
import { Loader, PlusIcon } from "lucide-react";

import { useProjectId } from "@/features/projects/hooks/useProjectId";
import { useGetProjects } from "@/features/projects/api/useGetProjects";
import { useWorkspaceId } from "@/features/workspaces/hooks/useWorkspaceId";

import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { DataKanban } from "./data-kanban";
import { DataFilters } from "./data-filters";
import { DataCalendar } from "./data-calendar";

import { TaskDifficulty, TaskStatus } from "../types";
import { useGetTasks } from "../api/useGetTasks";
import { useTaskFilters } from "../hooks/use-task-filters";
import { useBulkUpdateTask } from "../api/useBulkUpdateTask";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";

interface TaskViewSwticherProps {
  hideProjectFilter?: boolean;
}

export const TaskViewSwticher = ({
  hideProjectFilter,
}: TaskViewSwticherProps) => {
  const [{ assigneeId, dueDate, projectId, search, status }] = useTaskFilters();
  const [view, setView] = useQueryState("task-view", { defaultValue: "table" });

  const workspaceId = useWorkspaceId();
  const paramProjectId = useProjectId();
  const { open } = useCreateTaskModal();
  const { data: projects } = useGetProjects({ workspaceId });
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
    assigneeId,
    dueDate,
    projectId: paramProjectId || projectId,
    search,
    status,
  });
  const { mutate: bulkUpdate } = useBulkUpdateTask();

  const onKanbanChange = useCallback(
    (tasks: { id: string; status: TaskStatus; position: number }[]) => {
      bulkUpdate({ json: { tasks } });
    },
    [bulkUpdate]
  );

  const normalizedTasks =
    tasks?.documents.map((task) => ({
      ...task,
      status: TaskStatus[task.status as keyof typeof TaskStatus],
      description: task.description ?? null,
      dueDate: task.dueDate ?? "",
      assignee: task.assignee ?? null,
      project: {
        id: task.project?.id ?? "",
        name: task.project?.name ?? "N/A", // ✅ evita null
      },
      // Map enum value to its string representation
      difficulty: TaskDifficulty[
        task.difficulty as keyof typeof TaskDifficulty
      ] as "Facil" | "Medio" | "Dificil",
    })) ?? [];

  return (
    <Tabs
      className="flex-1 w-full border rounded-lg"
      defaultValue={view}
      onValueChange={setView}
    >
      <div className="h-full flex flex-col overflow-auto p-4">
        <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger className="h-8 w-full lg:w-auto" value="table">
              Table
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full lg:w-auto" value="kanban">
              Kanban
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full lg:w-auto" value="calendar">
              Calendar
            </TabsTrigger>
          </TabsList>
          <Button
            size="sm"
            className="w-full lg:w-auto"
            onClick={() => open(undefined)}
          >
            <PlusIcon className="size-4 mr-2" />
            New Task
          </Button>
        </div>

        <DottedSeparator className="my-4" />
        <DataFilters hideProjectFilter={hideProjectFilter} />
        <DottedSeparator className="my-4" />

        {isLoadingTasks ? (
          <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center">
            <Loader className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {}
            <TabsContent value="table" className="mt-0">
              <DataTable columns={columns} data={normalizedTasks} />
            </TabsContent>

            <TabsContent value="kanban" className="mt-0">
              <DataKanban data={normalizedTasks} onChange={onKanbanChange} />
            </TabsContent>

            <TabsContent value="calendar" className="mt-0 h-full pb-4">
              <DataCalendar data={normalizedTasks} projects={projects} />
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};
