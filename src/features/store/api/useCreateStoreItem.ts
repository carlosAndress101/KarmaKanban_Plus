import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type StoreItemData = {
  workspaceId: string;
  name: string;
  description: string;
  pointsCost: number;
  category: "Physical" | "Digital" | "Experience" | "Perk";
  stock?: number;
  imageUrl?: string;
};

export const useCreateStoreItem = ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<StoreItemData, "workspaceId">) => {
      const response = await client.api.store.$post({
        json: {
          workspaceId,
          ...data,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        let errorMessage = "Failed to create store item";
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
      toast.success("Store item created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
