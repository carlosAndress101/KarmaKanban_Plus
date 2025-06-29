import { ListCheckIcon, UserIcon, FolderIcon } from "lucide-react";

import { useGetMember } from "@/features/members/api/useGetMember";
import { useGetProjects } from "@/features/projects/api/useGetProjects";
import { useWorkspaceId } from "@/features/workspaces/hooks/useWorkspaceId";

import { DatePicker } from "@/components/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { TaskStatus } from "../types";
import { useTaskFilters } from "../hooks/use-task-filters";

interface DataFiltersProps {
  hideProjectFilter?: boolean;
}

export const DataFilters = ({ hideProjectFilter }: DataFiltersProps) => {
  const workspaceId = useWorkspaceId();

  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });
  const { data: members, isLoading: isLoadingMembers } = useGetMember({
    workspaceId,
  });

  const isLoading = isLoadingProjects || isLoadingMembers;

  interface ProjectOption {
    value: string;
    label: string;
  }

  const projectOptions: ProjectOption[] | undefined = projects?.map((project: { id: string; name: string }) => ({
    value: project.id,
    label: project.name,
  }));

  interface MemberOption {
    value: string;
    label: string;
  }

  interface Member {
    id: string;
    name: string;
  }

  const memberOptions: MemberOption[] | undefined = members?.map((member: Member) => ({
    value: member.id,
    label: member.name,
  }));

  const [{ assigneeId, dueDate, projectId, status }, setFilters] =
    useTaskFilters();

  const onFilterChange = (
    value: string | Date | TaskStatus | null,
    type: "status" | "assigneeId" | "projectId" | "dueDate"
  ) => {
    if (value === "all" || !value) {
      value = null;
    } else {
      if (type === "dueDate") {
        value = (value as Date).toISOString();
      }
    }

    setFilters({
      [type]: value,
    });
  };

  if (isLoading) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-2">
      <Select
        defaultValue={status ?? undefined}
        onValueChange={(value) => onFilterChange(value, "status")}
      >
        <SelectTrigger className="w-full lg:w-auto h-8">
          <div className="flex items-center pr-2">
            <ListCheckIcon className="size-4 mr-2" />
            <SelectValue placeholder="Todos los estados" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectSeparator />
          <SelectItem value={TaskStatus.BACKLOG}>Pendientes</SelectItem>
          <SelectItem value={TaskStatus.IN_PROGRESS}>En Progreso</SelectItem>
          <SelectItem value={TaskStatus.IN_REVIEW}>En Revisión</SelectItem>
          <SelectItem value={TaskStatus.TODO}>Por Hacer</SelectItem>
          <SelectItem value={TaskStatus.DONE}>Completada</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={assigneeId ?? undefined}
        onValueChange={(value) => onFilterChange(value, "assigneeId")}
      >
        <SelectTrigger className="w-full lg:w-auto h-8">
          <div className="flex items-center pr-2">
            <UserIcon className="size-4 mr-2" />
            <SelectValue placeholder="Todos los asignados" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los asignados</SelectItem>
          <SelectSeparator />
          {memberOptions?.map((member) => (
            <SelectItem key={member.value} value={member.value}>
              {member.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!hideProjectFilter && (
        <Select
          defaultValue={projectId ?? undefined}
          onValueChange={(value) => onFilterChange(value, "projectId")}
        >
          <SelectTrigger className="w-full lg:w-auto h-8">
            <div className="flex items-center pr-2">
              <FolderIcon className="size-4 mr-2" />
              <SelectValue placeholder="Todos los proyectos" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los proyectos</SelectItem>
            <SelectSeparator />
            {projectOptions?.map((project) => (
              <SelectItem key={project.value} value={project.value}>
                {project.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <DatePicker
        placeholder="Due date"
        onChange={(value) => onFilterChange(value, "dueDate")}
        className="h-8 w-full lg:w-auto"
        value={dueDate ? new Date(dueDate) : undefined}
      />
    </div>
  );
};
