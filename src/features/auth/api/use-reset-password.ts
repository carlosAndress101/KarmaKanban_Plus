import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type RequestType = InferRequestType<typeof client.api.auth["reset-password"]["$post"]>;
type ResponseType = InferResponseType<typeof client.api.auth["reset-password"]["$post"]>;

export const useResetPassword = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth["reset-password"]["$post"]({ json });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar contraseña");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Contraseña actualizada correctamente");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar contraseña");
    },
  });

  return mutation;
};
