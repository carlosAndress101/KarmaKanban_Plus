import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type RequestType = InferRequestType<typeof client.api.auth["forgot-password"]["$post"]>;
type ResponseType = InferResponseType<typeof client.api.auth["forgot-password"]["$post"]>;

export const useForgotPassword = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth["forgot-password"]["$post"]({ json });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al enviar código de verificación");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Código de verificación enviado");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Error al enviar código de verificación");
    },
  });

  return mutation;
};
