import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<(typeof client.api.auth.logout)["$post"]>;

// Type for API error response
type ApiErrorResponse = {
  error?: string;
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.auth.logout["$post"]();
      if (!response.ok) {
        // Capture specific error message from backend
        const errorData = (await response
          .json()
          .catch(() => ({}))) as ApiErrorResponse;
        const errorMessage = errorData?.error || "Failed to log out";
        throw new Error(errorMessage);
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Logged out successfully. See you soon!");
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ["current"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: (error) => {
      toast.error(error.message || "An error occurred while logging out");
    },
  });

  return mutation;
};
