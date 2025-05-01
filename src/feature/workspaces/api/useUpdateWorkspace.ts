import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["$patch"], 200>;
type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"]["$patch"]>;

export const useUpdateWorkspace = () => {

    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json, param }) => {
            const response = await client.api.workspaces[":workspaceId"]["$patch"]({ json, param });
            
            if (!response.ok) {
				throw new Error("Failed to create workspace");
			}
			return await response.json();
        },
        onSuccess: ({ data }) => {
            toast.success("Workspace actualizado"); 
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            queryClient.invalidateQueries({ queryKey: ["workspace", data[0].id] });
        },
        onError: () => {
            toast.error("Hubo un error al actualizar el workspace");
        }
    });

    return mutation;
}