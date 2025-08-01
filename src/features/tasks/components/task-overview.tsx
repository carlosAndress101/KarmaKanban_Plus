import { PencilIcon } from "lucide-react";

import { snakeCaseToTitleCase } from "@/lib/utils";
import { MemberAvatar } from "@/features/members/components/meberAvatar";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-separator";

import { TaskFront } from "../types";
import { TaskDate } from "./task-date";
import { OverviewProperty } from "./overview-property";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";

interface TaskOverviewProps {
  task: TaskFront;
}

export const TaskOveriew = ({ task }: TaskOverviewProps) => {
  const { open } = useEditTaskModal();

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Descripción general</p>
          <Button size="sm" variant="secondary" onClick={() => open(task.id)}>
            <PencilIcon className="size-4 mr-2" />
            Editar
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <div className="flex flex-col gap-y-4">
          <OverviewProperty label="Asignado">
            {typeof task.assignee === "string" ? (
              <>
                <MemberAvatar name="Sin asignar" />
                <p className="text-sm font-medium">Sin asignar</p>
              </>
            ) : (
              <>
                <MemberAvatar name={task.assignee.name} />
                <p className="text-sm font-medium">{task.assignee.name}</p>
              </>
            )}
          </OverviewProperty>

          <OverviewProperty label="Fecha de vencimiento">
            <TaskDate value={task.dueDate} className="text-sm font-medium" />
          </OverviewProperty>

          <OverviewProperty label="Estado">
            <Badge variant={task.status}>
              {snakeCaseToTitleCase(task.status)}
            </Badge>
          </OverviewProperty>

          <OverviewProperty label="Dificultad">
            <Badge
              variant={task.difficulty}
            >
              {snakeCaseToTitleCase(task.difficulty)}
            </Badge>
          </OverviewProperty>
        </div>
      </div>
    </div>
  );
};
