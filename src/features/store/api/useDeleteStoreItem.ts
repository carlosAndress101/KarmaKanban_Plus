import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

export const useDeleteStoreItem = ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storeItemId: string) => {
      const response = await client.api.store[":storeItemId"]["$delete"]({
        param: { storeItemId },
      });

      if (!response.ok) {
        const error = await response.json();
        let errorMessage = "Failed to delete store item";
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-items", workspaceId] });
      toast.success("Store item deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
