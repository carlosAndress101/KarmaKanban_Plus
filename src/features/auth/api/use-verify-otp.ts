import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type RequestType = InferRequestType<
  (typeof client.api.auth)["verify-otp"]["$post"]
>;
type ResponseType = InferResponseType<
  (typeof client.api.auth)["verify-otp"]["$post"]
>;

export const useVerifyOtp = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth["verify-otp"]["$post"]({ json });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Código OTP inválido");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Código verificado correctamente");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Error al verificar código OTP");
    },
  });

  return mutation;
};
