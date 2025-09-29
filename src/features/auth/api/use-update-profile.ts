"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.auth.profile.$patch>;
type RequestType = InferRequestType<
  typeof client.api.auth.profile.$patch
>["json"];

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.auth.profile.$patch({ json });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error((errorData as any).error || "Failed to update profile");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Update the current user in the query cache
      queryClient.invalidateQueries({ queryKey: ["current"] });

      const response = data as any;
      if (response.success) {
        toast.success(response.message || "Profile updated successfully");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  return mutation;
};
