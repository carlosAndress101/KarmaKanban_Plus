import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { StoreItem } from "../types";

interface UseGetStoreItemsProps {
  workspaceId: string;
}

export const useGetStoreItems = ({ workspaceId }: UseGetStoreItemsProps) => {
  const query = useQuery({
    queryKey: ["store-items", workspaceId],
    queryFn: async () => {
      const response = await client.api.store["$get"]({
        query: { workspaceId },
      });

      if (!response.ok) {
        // Capturar el mensaje de error específico del backend
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          (errorData as any)?.error || "Failed to fetch store items";
        throw new Error(errorMessage);
      }

      const { data } = await response.json();
      type StoreItemApi = Omit<StoreItem, "createdAt" | "updatedAt"> & {
        createdAt: string;
        updatedAt: string;
      };
      return (data as StoreItemApi[]).map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }));
    },
  });

  return query;
};
