import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";
import { parseApiError } from "@/lib/api-error-types";

type ResponseType = InferResponseType<
  (typeof client.api.projects)[":projectId"]["manager"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.projects)[":projectId"]["manager"]["$patch"]
>;

export const useUpdateProjectManager = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, json }) => {
      const response = await client.api.projects[":projectId"][
        "manager"
      ].$patch({
        param,
        json,
      });

      if (!response.ok) {
        // Capture specific error message from backend
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = parseApiError(
          errorData,
          "Failed to update project manager"
        );
        throw new Error(errorMessage);
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Project manager updated successfully");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update project manager");
    },
  });

  return mutation;
};
