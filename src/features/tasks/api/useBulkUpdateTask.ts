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

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.tasks["bulk-update"][
        "$post"
      ]({
        json,
      });

      if (!response.ok) {
        throw new Error("Failed to update tasks");
      }

      return await response.json();
    },

    onMutate: async ({ json }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);

      if (previousTasks) {
        const updatedTasks = [...previousTasks];
        for (const update of json.tasks) {
          const taskIndex = updatedTasks.findIndex((t) => t.id === update.id);
          if (taskIndex !== -1) {
            updatedTasks[taskIndex] = {
              ...updatedTasks[taskIndex],
              status: update.status,
              position: update.position,
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
      toast.error("Failed to update tasks");
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return mutation;
};
