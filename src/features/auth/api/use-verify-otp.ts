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

type SuccessResponse = {
  success: true;
  message: string;
  resetToken: string;
};

type ErrorResponse = {
  error: string;
};

// Type guard functions
const isErrorResponse = (data: ResponseType): data is ErrorResponse => {
  return "error" in data;
};

const isSuccessResponse = (data: ResponseType): data is SuccessResponse => {
  return "success" in data && data.success === true && "resetToken" in data;
};

export const useVerifyOtp = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth["verify-otp"]["$post"]({ json });

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        throw new Error(errorData.error || "Código OTP inválido");
      }

      const data = await response.json();
      if (isErrorResponse(data)) {
        throw new Error(data.error);
      }
      return data;
    },
    onSuccess: (data) => {
      if (isSuccessResponse(data)) {
        toast.success(data.message || "Código verificado correctamente");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Error al verificar código OTP");
    },
  });

  return mutation;
};
