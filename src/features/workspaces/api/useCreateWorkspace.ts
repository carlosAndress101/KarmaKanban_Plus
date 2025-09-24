import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<(typeof client.api.workspaces)["$post"]>;
type RequestType = InferRequestType<(typeof client.api.workspaces)["$post"]>;

// Type for API error response
type ApiErrorResponse = {
  error?: string;
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      const response = await client.api.workspaces["$post"]({
        form,
      });

      if (!response.ok) {
        // Capture specific error message from backend
        const errorData = (await response
          .json()
          .catch(() => ({}))) as ApiErrorResponse;
        const errorMessage = errorData?.error || "Failed to create workspace";
        throw new Error(errorMessage);
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success(
        "Workspace created successfully! You can now start organizing your projects"
      );
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create workspace");
    },
  });

  return mutation;
};
