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
        throw new Error("Failed to fetch store items");
      }

      const { data } = await response.json();
      return data as StoreItem[];
    },
  });

  return query;
};
