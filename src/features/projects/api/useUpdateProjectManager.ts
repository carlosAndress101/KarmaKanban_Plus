import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.projects[":projectId"]["manager"]["$patch"], 200>;
type RequestType = InferRequestType<typeof client.api.projects[":projectId"]["manager"]["$patch"]>;

export const useUpdateProjectManager = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, json }) => {
      const response = await client.api.projects[":projectId"]["manager"].$patch({
        param,
        json,
      });
      
      if (!response.ok) {
        throw new Error("Failed to update project manager");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Project manager updated successfully");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
    onError: () => {
      toast.error("Failed to update project manager");
    },
  });

  return mutation;
};
