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
      type RedemptionRequestApi = Omit<
        RedemptionRequest,
        "reviewedAt" | "createdAt" | "updatedAt"
      > & {
        reviewedAt: string | null;
        createdAt: string;
        updatedAt: string;
      };
      return (data as RedemptionRequestApi[]).map((item) => ({
        ...item,
        reviewedAt: item.reviewedAt ? new Date(item.reviewedAt) : undefined,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }));
    },
  });

  return query;
};
