import { useRouter } from "next/navigation";
import {
  ExternalLinkIcon,
  PencilIcon,
  TrashIcon,
  ArchiveIcon,
  ArchiveRestoreIcon,
} from "lucide-react";

import { useConfirm } from "@/hooks/useConfirm";
import { useWorkspaceId } from "@/features/workspaces/hooks/useWorkspaceId";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useDeleteTask } from "../api/useDeleteTask";
import { useArchiveTask } from "../api/useArchiveTask";
import { useUnarchiveTask } from "../api/useUnarchiveTask";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";

interface TaskActionsProps {
  id: string;
  projectId: string;
  children: React.ReactNode;
  archived?: boolean;
}

export const TaskActions = ({
  children,
  id,
  projectId,
  archived = false,
}: TaskActionsProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { open } = useEditTaskModal();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete task",
    "This action cannot be undone.",
    "destructive"
  );
  const [ArchiveConfirmDialog, confirmArchive] = useConfirm(
    archived ? "Restore task" : "Archive task",
    archived
      ? "This task will be moved back to active tasks."
      : "This task will be moved to archived tasks.",
    archived ? "default" : "destructive"
  );
  const { mutate, isPending } = useDeleteTask();
  const { mutate: archiveTask, isPending: isArchiving } = useArchiveTask();
  const { mutate: unarchiveTask, isPending: isUnarchiving } =
    useUnarchiveTask();

  const onDelete = async () => {
    const ok = await confirm();
    if (!ok) return;

    mutate({ param: { taskId: id } });
  };

  const onArchive = async () => {
    const ok = await confirmArchive();
    if (!ok) return;

    if (archived) {
      unarchiveTask({ param: { taskId: id } });
    } else {
      archiveTask({ param: { taskId: id } });
    }
  };

  const onOpenTask = () => {
    router.push(`/workspaces/${workspaceId}/tasks/${id}`);
  };

  const onOpenProject = () => {
    router.push(`/workspaces/${workspaceId}/projects/${projectId}`);
  };

  return (
    <div className="flex justify-end">
      <ConfirmDialog />
      <ArchiveConfirmDialog />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-48" align="end">
          <DropdownMenuItem
            onClick={onOpenTask}
            className="font-medium p-[10px]"
          >
            <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
            Task details
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={onOpenProject}
            className="font-medium p-[10px]"
          >
            <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
            Open project
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => open(id)}
            className="font-medium p-[10px]"
          >
            <PencilIcon className="size-4 mr-2 stroke-2" />
            Edit task
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={onArchive}
            disabled={isArchiving || isUnarchiving}
            className="font-medium p-[10px]"
          >
            {archived ? (
              <ArchiveRestoreIcon className="size-4 mr-2 stroke-2" />
            ) : (
              <ArchiveIcon className="size-4 mr-2 stroke-2" />
            )}
            {archived ? "Restore task" : "Archive task"}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={onDelete}
            disabled={isPending}
            className="text-amber-700 focus:text-amber-700 font-medium p-[10px]"
          >
            <TrashIcon className="size-4 mr-2 stroke-2" />
            Delete task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
