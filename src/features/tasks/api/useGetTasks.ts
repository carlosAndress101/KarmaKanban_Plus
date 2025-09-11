import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

import { TaskStatus } from "../types";

interface UseGetTasksProps {
  workspaceId: string;
  projectId?: string | null;
  status?: TaskStatus | null;
  assigneeId?: string | null;
  dueDate?: string | null;
  search?: string | null;
  difficulty?: string | null;
  archived?: boolean;
}

export const useGetTasks = ({
  workspaceId,
  assigneeId,
  dueDate,
  projectId,
  status,
  search,
  difficulty,
  archived,
}: UseGetTasksProps) => {
  const query = useQuery({
    queryKey: [
      "tasks",
      workspaceId,
      assigneeId,
      dueDate,
      projectId,
      status,
      search,
      difficulty,
      archived,
    ],
    queryFn: async () => {
      const response = await client.api.tasks.$get({
        query: {
          workspaceId,
          assigneeId: assigneeId ?? undefined,
          dueDate: dueDate ?? undefined,
          projectId: projectId ?? undefined,
          status: status ?? undefined,
          search: search ?? undefined,
          difficulty: difficulty ?? undefined,
          archived: archived ? "true" : undefined,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const { data } = await response.json();

      return data;
    },
  });
  return query;
};
