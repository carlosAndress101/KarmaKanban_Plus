import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

import { Project } from "@/features/projects/schemas";
import { MemberAvatar } from "@/features/members/components/meberAvatar";
import { ProjectAvatar } from "@/features/projects/components/projectAvatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/useWorkspaceId";

import { TaskStatus } from "../types";

interface EventCardProps {
  id: string;
  title: string;
  assignee: {
    id: string | null;
    name: string | null;
    lastName: string | null;
  } | null;
  project: Project;
  status: TaskStatus;
}

const statusColorMap: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: "border-l-pink-500",
  [TaskStatus.TODO]: "border-l-red-500",
  [TaskStatus.IN_PROGRESS]: "border-l-yellow-500",
  [TaskStatus.IN_REVIEW]: "border-l-blue-500",
  [TaskStatus.DONE]: "border-l-emerald-500",
};

export const EventCard = ({
  assignee,
  id,
  project,
  status,
  title,
}: EventCardProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    router.push(`/workspaces/${workspaceId}/tasks/${id}`);
  };

  return (
    <div className="px-2">
      <div
        onClick={onClick}
        className={cn(
          "p-1.5 text-xs bg-white text-primary border rounded-md border-l-4 flex flex-col gap-y-1.5 cursor-pointer hover:opacity-75 transition",
          statusColorMap[status]
        )}
      >
        <p>{title}</p>
        <div className="flex items-center gap-x-1">
          <MemberAvatar name={assignee?.name || "Sin asignar"} />
          <div className="size-1 rounded-full bg-neutral-300" />
          <ProjectAvatar name={project.name} />
        </div>
      </div>
    </div>
  );
};
