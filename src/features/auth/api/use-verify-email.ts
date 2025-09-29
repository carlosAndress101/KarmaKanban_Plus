"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { toast } from "sonner";

type VerifyEmailData = {
  email: string;
  otp: string;
};

export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: VerifyEmailData) => {
      const response = await client.api.auth["verify-email"].$post({
        json: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          (errorData as { error?: string }).error || "Failed to verify email"
        );
      }

      return response.json();
    },
    onSuccess: (data: { success?: boolean }) => {
      // Update the current user in the query cache
      queryClient.invalidateQueries({ queryKey: ["current"] });

      if (data.success) {
        toast.success("Email verified successfully");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to verify email");
    },
  });

  return mutation;
};
