import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { z } from "zod";
import { toast } from "sonner";

const updateStoreItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  pointsCost: z.number().min(1).optional(),
  category: z.enum(["Physical", "Digital", "Experience", "Perk"]).optional(),
  stock: z.number().optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

type UpdateStoreItemData = z.infer<typeof updateStoreItemSchema>;

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["store-items", workspaceId] });
      toast.success("Store item updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
