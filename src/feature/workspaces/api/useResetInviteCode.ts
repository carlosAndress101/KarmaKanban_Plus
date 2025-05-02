import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

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
      const response = await client.api.workspaces[":workspaceId"]["reset-invite-code"]["$post"]({param});

      if (!response.ok) {
        throw new Error("Fallo al resetear el codigo de invitación");
      }

      return await response.json();
    },
    onSuccess: (response) => {
      toast.success("Codigo de invitación reseteado");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace", response.data[0].id]});
      
      // Llamar al callback si se proporciona
      if (onSuccessCallback) {
        onSuccessCallback(response);
      }
    },
    onError: () => {
      toast.error("Fallo al resetear el codigo de invitación");
    },
  });
  return mutation;
};