import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["archive"]["$patch"], 200>;
type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["archive"]["$patch"]>;

export const useArchiveTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.tasks[":taskId"]["archive"]["$patch"]({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to archive task");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Task archived");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      toast.error("Failed to archive task");
    },
  });

  return mutation;
};
