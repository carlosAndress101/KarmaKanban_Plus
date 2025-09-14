import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type RequestType = InferRequestType<typeof client.api.auth["resend-otp"]["$post"]>;
type ResponseType = InferResponseType<typeof client.api.auth["resend-otp"]["$post"]>;

export const useResendOtp = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth["resend-otp"]["$post"]({ json });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al reenviar código OTP");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Nuevo código de verificación enviado");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Error al reenviar código OTP");
    },
  });

  return mutation;
};
