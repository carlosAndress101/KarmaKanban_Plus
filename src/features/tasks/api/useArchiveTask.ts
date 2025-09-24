import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";
import { parseApiError } from "@/lib/api-error-types";

type ResponseType = InferResponseType<
  (typeof client.api.tasks)[":taskId"]["archive"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)[":taskId"]["archive"]["$patch"]
>;

export const useArchiveTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.tasks[":taskId"]["archive"]["$patch"]({
        param,
      });

      if (!response.ok) {
        // Capture specific error message from backend
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = parseApiError(errorData, "Failed to archive task");
        throw new Error(errorMessage);
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success(
        "Task archived successfully. You can find it in the archived section"
      );
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to archive task");
    },
  });

  return mutation;
};
