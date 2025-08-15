import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { ReviewRedemptionRequest } from "../types";

interface UseReviewRedemptionProps {
  workspaceId: string;
}

export const useReviewRedemption = ({
  workspaceId,
}: UseReviewRedemptionProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      data,
    }: {
      requestId: string;
      data: ReviewRedemptionRequest;
    }) => {
      const response = await client.api.store.redemptions[":requestId"][
        "$patch"
      ]({
        param: { requestId },
        json: data,
      });
      if (!response.ok) {
        const error = await response.json();
        let errorMessage = "Failed to review redemption request";
        if (
          typeof error === "object" &&
          error !== null &&
          "error" in error &&
          typeof error.error === "string"
        ) {
          errorMessage = error.error;
        }
        throw new Error(errorMessage);
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success("Redemption request updated successfully!");
      queryClient.invalidateQueries({
        queryKey: ["store-redemptions", workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ["current"] });
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
