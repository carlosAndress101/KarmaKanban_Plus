"use client";

import { useMutation } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { toast } from "sonner";

export const useSendVerificationEmail = () => {
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await client.api.auth["send-verification-email"].$post();

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          (errorData as any).error || "Failed to send verification email"
        );
      }

      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast.success("Verification email sent successfully");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send verification email");
    },
  });

  return mutation;
};
