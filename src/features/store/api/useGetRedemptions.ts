import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { RedemptionRequest } from "../types";
import { parseApiError } from "@/lib/api-error-types";

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
        // Capture specific error message from backend
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = parseApiError(
          errorData,
          "Failed to fetch redemption requests"
        );
        throw new Error(errorMessage);
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
