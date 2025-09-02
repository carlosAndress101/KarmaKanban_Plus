import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRightIcon, TrashIcon } from "lucide-react";

import { Project } from "@/features/projects/types";
import { ProjectAvatar } from "@/features/projects/components/projectAvatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/useWorkspaceId";

import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/useConfirm";

import { TaskFront } from "../types";
import { useDeleteTask } from "../api/useDeleteTask";

interface TaskBreadcrumbsProps {
  project: Project;
  task: TaskFront;
}

export const TaskBreadcrumbs = ({ project, task }: TaskBreadcrumbsProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const [ConfirmDialog, confirm] = useConfirm(
    "Eliminar tarea",
    "¿Estás seguro de que quieres eliminar esta tarea?",
    "destructive"
  );

  const { mutate, isPending } = useDeleteTask();

  const onDelete = async () => {
    const ok = await confirm();
    if (!ok) return;

    mutate(
      { param: { taskId: task.id } },
      {
        onSuccess: () => {
          router.push(`/workspaces/${workspaceId}/tasks`);
        },
      }
    );
  };

  return (
    <div className="flex items-center gap-x-2">
      <ConfirmDialog />
      <ProjectAvatar name={project.name} className="size-6 lg:size-8" />

      <Link
        href={`/workspaces/${workspaceId}/projects/${project.id}`}
        className="text-sm lg:text-lg font-semibold text-muted-foreground hover:opacity-75 transition"
      >
        {project.name}
      </Link>

      <ChevronRightIcon className="size-4 lg:size-5 text-muted-foreground" />

      <p className="text-sm lg:text-lg font-semibold">{task.name}</p>

      <Button
        className="ml-auto"
        variant="destructive"
        size="sm"
        onClick={onDelete}
        disabled={isPending}
      >
        <TrashIcon className="size-4 mr-2" />
        <span className="hidden lg:block">Eliminar tarea</span>
      </Button>
    </div>
  );
};
