import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { User } from "@/features/auth/schemas";

export const useCurrent = () => {
    const query = useQuery({
        queryKey: ["current"],
        queryFn: async () => {
            try {
                const response = await client.api.auth.current.$get();

                if (!response.ok) {
                    if (response.status === 401) {
                        return null;
                    }
                    throw new Error('Failed to fetch user');
                }

                const { data } = await response.json();
                return data as User;
            } catch (error) {
                console.error('Error fetching current user:', error);
                return null;
            }
        },
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return query;
}