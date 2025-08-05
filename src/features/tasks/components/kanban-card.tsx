import { MoreHorizontal } from "lucide-react";

import { Task } from "../types";
import { TaskActions } from "./task-actions";
import { DottedSeparator } from "@/components/dotted-separator";
import { MemberAvatar } from "@/features/members/components/meberAvatar";
import { TaskDate } from "./task-date";
import { ProjectAvatar } from "@/features/projects/components/projectAvatar";
import { Badge } from "@/components/ui/badge";
import { TaskPoints } from "./task-points";

interface KanbanCardProps {
  task: Task;
}

export const KanbanCard = ({ task }: KanbanCardProps) => {
  return (
    <div className="bg-white p-2.5 mb-1.5 rounded shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-x-2">
        <p className="text-sm line-clamp-2">{task.name}</p>

        <TaskActions id={task.id} projectId={task.project.id}>
          <MoreHorizontal className="size-[18px] stroke-1 shrink-0 text-neutral-700 hover:opacity-75 transition" />
        </TaskActions>
      </div>

      <DottedSeparator />

      <div className="flex items-center gap-x-1.5">
        <MemberAvatar
          name={task.assignee?.name || "Sin asignar"}
          className="size-6"
          fallbackClassName="text-[10px]"
        />
        <div className="size-1 rounded-full bg-neutral-300" />
        <TaskDate value={task.dueDate} className="text-xs" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-1.5">
          <ProjectAvatar
            name={task.project.name}
            fallbackClassname="text-[10px]"
            />
          <span className="text-xs font-medium">{task.project.name}</span>
        </div>
        
        <div className="flex items-center gap-x-1.5">
          {task.difficulty && (
            <Badge variant={task.difficulty} className="text-xs">
              {task.difficulty}
            </Badge>
          )}
          <TaskPoints difficulty={task.difficulty} size="sm" />
        </div>
      </div>
    </div>
  );
};
