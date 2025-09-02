import { Loader } from "lucide-react";

import { useGetMember } from "@/features/members/api/useGetMember";
import { useGetProjects } from "@/features/projects/api/useGetProjects";
import { useWorkspaceId } from "@/features/workspaces/hooks/useWorkspaceId";

import { Card, CardContent } from "@/components/ui/card";
import { CreateTaskForm } from "./create-task-form";

interface CreateTaskFormWrapperProps {
  onCancel: () => void;
}

export const CreateTaskFormWrapper = ({
  onCancel,
}: CreateTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();

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

  interface MemberOption {
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

  const memberOptions: MemberOption[] | undefined = members?.map(
    (member: Member) => ({
      id: member.id,
      name: member.name,
    })
  );

  const isLoading = isLoadingMembers || isLoadingProjects;

  if (isLoading) {
    return (
      <Card className="w-full h-[714px] border-noen shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <CreateTaskForm
      onCancel={onCancel}
      projectOptions={projectOptions ?? []}
      memberOptions={memberOptions ?? []}
    />
  );
};
