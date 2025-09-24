import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.workspaces)[":workspaceId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.workspaces)[":workspaceId"]["$delete"]
>;

// Type for API error response
type ApiErrorResponse = {
  error?: string;
};

export const useDeleteWorkspace = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.workspaces[":workspaceId"]["$delete"]({
        param,
      });

      if (!response.ok) {
        // Capture specific error message from backend
        const errorData = (await response
          .json()
          .catch(() => ({}))) as ApiErrorResponse;
        const errorMessage =
          errorData?.error || "Failed to delete the workspace";
        throw new Error(errorMessage);
      }

      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success(
        "Workspace deleted successfully. All data has been removed"
      );

      router.push("/");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace", data.id] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete the workspace");
    },
  });
  return mutation;
};
