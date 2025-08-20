import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type UpdateStoreItemData = {
  name?: string;
  description?: string;
  pointsCost?: number;
  category?: "Physical" | "Digital" | "Experience" | "Perk";
  stock?: number;
  imageUrl?: string;
  isActive?: boolean;
};

export const useUpdateStoreItem = ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      storeItemId,
      data,
    }: {
      storeItemId: string;
      data: UpdateStoreItemData;
    }) => {
      const response = await client.api.store[":storeItemId"]["$patch"]({
        param: { storeItemId },
        json: data,
      });

      if (!response.ok) {
        const error = await response.json();
        let errorMessage = "Failed to update store item";
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
      toast.success("Store item updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
