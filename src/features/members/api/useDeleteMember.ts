import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

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
        const errorMessage =
          (errorData as any)?.error || "Failed to remove the member";

        throw new Error(errorMessage);
      }

      return await response.json();
    },
    onSuccess: (data) => {
      const message = (data as any)?.data?.message || "Member removed";
      toast.success(message);

      // Invalidar las queries antes de la redirección
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });

      // Redirigir a workspaces después de un breve delay para permitir que las queries se actualicen
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
