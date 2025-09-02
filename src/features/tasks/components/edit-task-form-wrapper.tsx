import { Loader } from "lucide-react";

import { useGetMember } from "@/features/members/api/useGetMember";
import { useGetProjects } from "@/features/projects/api/useGetProjects";
import { useWorkspaceId } from "@/features/workspaces/hooks/useWorkspaceId";

import { Card, CardContent } from "@/components/ui/card";

import { EditTaskForm } from "./edit-task-form";
import { useGetTask } from "../api/useGetTask";
import { normalizeAssignee, Task, TaskStatus } from "../types";

interface EditTaskFormWrapperProps {
  onCancel: () => void;
  id: string;
}

export const EditTaskFormWrapper = ({
  onCancel,
  id,
}: EditTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();

  const { data: initialValues, isLoading: isLoadingTask } = useGetTask({
    taskId: id,
  });
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });
  const { data: members, isLoading: isLoadingMembers } = useGetMember({
    workspaceId,
  });

  interface ProjectOption {
    id: string;
    name: string;
  }

  const projectOptions: ProjectOption[] | undefined = projects?.map(
    (project: { id: string; name: string }) => ({
      id: project.id,
      name: project.name,
    })
  );

  interface Member {
    id: string;
    name: string;
  }

  interface MemberOption {
    id: string;
    name: string;
  }

  const memberOptions: MemberOption[] | undefined = members?.map(
    (member: Member) => ({
      id: member.id,
      name: member.name,
    })
  );

  const isLoading = isLoadingMembers || isLoadingProjects || isLoadingTask;

  if (isLoading) {
    return (
      <Card className="w-full h-[714px] border-noen shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!initialValues) return undefined;

  const normalizedInitialValues: Task = {
    ...initialValues,
    status: initialValues.status as TaskStatus,
    dueDate: initialValues.dueDate ?? null,
    description: initialValues.description ?? null,
    assignee: normalizeAssignee(initialValues.assignee),
    project:
      typeof initialValues.project === "string"
        ? { id: initialValues.project, name: "N/A" } // o un nombre por defecto si lo tienes
        : {
            id: initialValues.project?.id ?? "",
            name: initialValues.project?.name ?? "N/A",
          },
  };

  return (
    <EditTaskForm
      onCancel={onCancel}
      projectOptions={projectOptions ?? []}
      memberOptions={memberOptions ?? []}
      initialValues={normalizedInitialValues}
    />
  );
};
