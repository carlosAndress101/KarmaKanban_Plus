import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.store.redemptions)["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.store.redemptions)["$post"]
>;

interface UseCreateRedemptionProps {
  workspaceId: string;
}

export const useCreateRedemption = ({
  workspaceId,
}: UseCreateRedemptionProps) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.store.redemptions["$post"]({
        json: {
          ...json,
          workspaceId,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to create redemption request"
        );
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Redemption request created successfully!");
      queryClient.invalidateQueries({
        queryKey: ["store-redemptions", workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ["current"] }); // Refresh user points
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] }); // Refresh member info
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create redemption request");
    },
  });

  return mutation;
};
