import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { parseApiError } from "@/lib/api-error-types";

type ResponseType = InferResponseType<
  (typeof client.api.workspaces)[":workspaceId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.workspaces)[":workspaceId"]["$patch"]
>;

export const useUpdateWorkspace = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const response = await client.api.workspaces[":workspaceId"]["$patch"]({
        json,
        param,
      });

      if (!response.ok) {
        // Capture specific error message from backend
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = parseApiError(
          errorData,
          "An error occurred while updating the workspace"
        );
        throw new Error(errorMessage);
      }
      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Workspace updated successfully! Changes have been saved");

      router.refresh();
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace", data[0].id] });
    },
    onError: (error) => {
      toast.error(
        error.message || "An error occurred while updating the workspace"
      );
    },
  });

  return mutation;
};
