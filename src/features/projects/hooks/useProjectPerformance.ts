import { useQuery } from "@tanstack/react-query";

export const useProjectPerformance = (workspaceId: string) => {
  return useQuery({
    queryKey: ["project-performance", workspaceId],
    queryFn: async () => {
      const res = await fetch(
        `/api/projects/performance?workspaceId=${workspaceId}`
      );
      if (!res.ok) throw new Error("Failed to fetch project performance stats");
      const data = await res.json();
      return data.stats;
    },
    enabled: !!workspaceId,
  });
};
