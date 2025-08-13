import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { RedemptionRequest } from "../types";

interface UseGetRedemptionsProps {
  workspaceId: string;
}

export const useGetRedemptions = ({ workspaceId }: UseGetRedemptionsProps) => {
  const query = useQuery({
    queryKey: ["store-redemptions", workspaceId],
    queryFn: async () => {
      const response = await client.api.store.redemptions["$get"]({
        query: { workspaceId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch redemption requests");
      }

      const { data } = await response.json();
      return data as RedemptionRequest[];
    },
  });

  return query;
};
