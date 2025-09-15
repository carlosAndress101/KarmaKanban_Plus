import { useMutation } from "@tanstack/react-query";
import { InferRequestType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type RequestType = InferRequestType<
  (typeof client.api.auth)["forgot-password"]["$post"]
>;

interface SuccessResponse {
  success: true;
  message: string;
}

type ApiResponse =
  | { success: true; message: string }
  | { success: false; error: string };

export const useForgotPassword = () => {
  const mutation = useMutation<SuccessResponse, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth["forgot-password"]["$post"]({
        json,
      });
      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.success ? "Error desconocido" : data.error);
      }

      return { success: true, message: data.message };
    },
    onSuccess: (data) => {
      toast.success(data.message || "Código de verificación enviado");
    },
    onError: (error) => {
      toast.error(error.message || "Error al enviar código de verificación");
    },
  });

  return mutation;
};
