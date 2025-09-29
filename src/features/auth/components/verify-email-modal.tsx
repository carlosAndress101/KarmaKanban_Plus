"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, CheckCircle, AlertCircle, Send } from "lucide-react";
import { useSendVerificationEmail } from "../api/use-send-verification-email";
import { useVerifyEmail } from "../api/use-verify-email";

const verifyOtpSchema = z.object({
  otp: z.string().length(6, "El código debe tener 6 dígitos"),
});

type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;

interface VerifyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  isEmailVerified?: boolean;
}

export const VerifyEmailModal = ({
  isOpen,
  onClose,
  userEmail,
  isEmailVerified = false,
}: VerifyEmailModalProps) => {
  const [emailSent, setEmailSent] = useState(false);

  const { mutate: sendEmail, isPending: isSending } =
    useSendVerificationEmail();
  const { mutate: verifyEmail, isPending: isVerifying } = useVerifyEmail();

  const form = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const sendVerificationEmail = () => {
    sendEmail(undefined, {
      onSuccess: () => {
        setEmailSent(true);
      },
    });
  };

  const onSubmit = (values: VerifyOtpFormValues) => {
    verifyEmail(
      {
        email: userEmail,
        otp: values.otp,
      },
      {
        onSuccess: () => {
          onClose();
          setEmailSent(false);
          form.reset();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Verificación de Email
          </DialogTitle>
          <DialogDescription>
            {isEmailVerified
              ? "Tu email ya está verificado."
              : "Verifica tu dirección de email para mayor seguridad."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {isEmailVerified ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Tu email <strong>{userEmail}</strong> está verificado
                correctamente.
              </AlertDescription>
            </Alert>
          ) : emailSent ? (
            <div className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Se ha enviado un código de verificación a{" "}
                  <strong>{userEmail}</strong>. Ingresa el código de 6 dígitos
                  para verificar tu email.
                </AlertDescription>
              </Alert>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código de verificación</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="123456"
                            maxLength={6}
                            disabled={isVerifying}
                            className="text-center text-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEmailSent(false);
                        form.reset();
                      }}
                      disabled={isVerifying}
                      className="flex-1"
                    >
                      Atrás
                    </Button>
                    <Button
                      type="submit"
                      disabled={isVerifying}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Verificar
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Tu email <strong>{userEmail}</strong> no está verificado. Te
                  enviaremos un código de verificación para confirmar tu
                  identidad.
                </AlertDescription>
              </Alert>

              <div className="text-sm text-muted-foreground">
                <p>Al verificar tu email podrás:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Recuperar tu contraseña si la olvidas</li>
                  <li>Recibir notificaciones importantes</li>
                  <li>Aumentar la seguridad de tu cuenta</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {!emailSent && (
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              {isEmailVerified ? "Cerrar" : "Más tarde"}
            </Button>

            {!isEmailVerified && (
              <Button
                onClick={sendVerificationEmail}
                disabled={isSending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar verificación
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
