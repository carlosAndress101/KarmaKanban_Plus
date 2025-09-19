import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { Task } from "../types";

type ResponseType = InferResponseType<
  (typeof client.api.tasks)["bulk-update"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)["bulk-update"]["$post"]
>;

export const useBulkUpdateTask = () => {
  const queryClient = useQueryClient();

  // Accept members as an argument for optimistic update
  type Member = { id: string; name: string | null; lastName?: string | null };
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType & { members?: Member[] }
  >({
    mutationFn: async ({ json }) => {
      const response = await client.api.tasks["bulk-update"]["$post"]({
        json,
      });

      if (!response.ok) {
        // Capturar el mensaje de error específico del backend
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          (errorData as any)?.error || "Failed to update tasks";
        throw new Error(errorMessage);
      }

      return await response.json();
    },

    onMutate: async ({ json, members }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);

      if (previousTasks) {
        const updatedTasks = [...previousTasks];
        for (const update of json.tasks) {
          const taskIndex = updatedTasks.findIndex((t) => t.id === update.id);
          if (taskIndex !== -1) {
            let newAssignee = updatedTasks[taskIndex].assignee;
            if (update.assigneeId && members) {
              const member = members.find((m) => m.id === update.assigneeId);
              if (member) {
                newAssignee = {
                  id: member.id,
                  name: member.name,
                  lastName: member.lastName ?? null,
                };
              } else {
                newAssignee = {
                  id: update.assigneeId,
                  name: null,
                  lastName: null,
                };
              }
            }
            updatedTasks[taskIndex] = {
              ...updatedTasks[taskIndex],
              status: update.status,
              position: update.position,
              assignee: newAssignee,
            };
          }
        }
        queryClient.setQueryData(["tasks"], updatedTasks);
      }

      return { previousTasks };
    },

    onError: (err, _variables, context) => {
      const typedContext = context as { previousTasks?: Task[] } | undefined;
      if (typedContext?.previousTasks) {
        queryClient.setQueryData(["tasks"], typedContext.previousTasks);
      }
      toast.error(err.message || "Failed to update tasks");
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["members"] }); // Refresh member data for points
      queryClient.invalidateQueries({ queryKey: ["gamification-stats"] }); // Refresh gamification stats
    },
  });

  return mutation;
};
