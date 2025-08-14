import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

export const useDeleteStoreItem = ({ workspaceId }: { workspaceId: string }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storeItemId: string) => {
      const response = await client.api.store[":storeItemId"]["$delete"]({
        param: { storeItemId },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete store item");
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
