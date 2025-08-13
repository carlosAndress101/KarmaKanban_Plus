import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { MemberStats } from "../utils/badge-manager";

interface UseGamificationStatsProps {
  workspaceId: string;
  memberId?: string;
}

export const useGamificationStats = ({ workspaceId, memberId }: UseGamificationStatsProps) => {
  const query = useQuery({
    queryKey: ["gamification-stats", workspaceId, memberId],
    queryFn: async () => {
      const response = await client.api.gamification.stats.$get({
        query: { workspaceId, ...(memberId && { memberId }) }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch gamification stats");
      }
      
      const { data } = await response.json();
      return data as MemberStats;
    }
  });

  return query;
};
