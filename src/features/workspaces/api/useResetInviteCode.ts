import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { parseApiError } from "@/lib/api-error-types";

type ResponseType = InferResponseType<
  (typeof client.api.workspaces)[":workspaceId"]["reset-invite-code"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.workspaces)[":workspaceId"]["reset-invite-code"]["$post"]
>;

// Tipo para el callback onSuccess
type OnSuccessCallback = (response: ResponseType) => void;

export const useResetInviteCode = (onSuccessCallback?: OnSuccessCallback) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.workspaces[":workspaceId"][
        "reset-invite-code"
      ]["$post"]({ param });

      if (!response.ok) {
        // Capture specific error message from backend
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = parseApiError(
          errorData,
          "Failed to reset the invitation code"
        );
        throw new Error(errorMessage);
      }

      return await response.json();
    },
    onSuccess: (response) => {
      toast.success(
        "Invitation code reset successfully. Share the new link with your team"
      );
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({
        queryKey: ["workspace", response.data[0].id],
      });

      // Llamar al callback si se proporciona
      if (onSuccessCallback) {
        onSuccessCallback(response);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reset the invitation code");
    },
  });
  return mutation;
};
