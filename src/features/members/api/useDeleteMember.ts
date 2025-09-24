import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { parseApiError } from "@/lib/api-error-types";

type ResponseType = InferResponseType<
  (typeof client.api.members)[":memberId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.members)[":memberId"]["$delete"]
>;

export const useDeleteMember = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.members[":memberId"]["$delete"]({
        param,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = parseApiError(
          errorData,
          "Failed to remove the member"
        );

        throw new Error(errorMessage);
      }

      return await response.json();
    },
    onSuccess: (data) => {
      const message =
        (data as ResponseType)?.data?.message ||
        "Member removed successfully! The member has been removed from the workspace";
      toast.success(message);

      // Invalidate queries before redirection
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });

      // Redirect to workspaces after a brief delay to allow queries to update
      setTimeout(() => {
        router.push("/");
      }, 100);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove the member");
    },
  });
  return mutation;
};
