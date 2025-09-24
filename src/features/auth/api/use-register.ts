import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<
  (typeof client.api.auth.register)["$post"]
>;
type RequestType = InferRequestType<(typeof client.api.auth.register)["$post"]>;

// Type for API error response
type ApiErrorResponse = {
  error?: string;
};

export const useRegister = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth.register["$post"]({
        json,
      });
      if (response.ok) {
        return await response.json();
      } else {
        // Capture specific error message from backend
        const errorData = (await response
          .json()
          .catch(() => ({}))) as ApiErrorResponse;
        const errorMessage = errorData?.error || "Registration failed";
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      toast.success("Account created successfully! Welcome to KarmaKanban");
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ["current"] });
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed");
    },
  });

  return mutation;
};
