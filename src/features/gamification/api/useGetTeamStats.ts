import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface useGetTeamStatsProps {
  workspaceId: string;
}

export const useGetTeamStats = ({ workspaceId }: useGetTeamStatsProps) => {
  const query = useQuery({
    queryKey: ["gamification", "team-stats", workspaceId],
    queryFn: async () => {
      const response = await client.api.gamification["team-stats"].$get({
        query: { workspaceId },
      });

      if (!response.ok) {
        throw new Error("Failed to get team statistics");
      }

      const { data } = await response.json();

      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 10000, // Consider data stale after 10 seconds
  });
  return query;
};
