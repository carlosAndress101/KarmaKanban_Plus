"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AlertCircle, Key, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useResetPassword } from "@/features/auth/api/use-reset-password";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Debe contener al menos una mayúscula, una minúscula y un número",
      ),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const { mutate: resetPassword, isPending: loading } = useResetPassword();
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    label: string;
    color: string;
  }>({ score: 0, label: "Muy débil", color: "bg-red-500" });

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Redirigir si no hay token
  useEffect(() => {
    if (!token) {
      router.push("/forgot-password");
    }
  }, [token, router]);

  // Evaluar fortaleza de contraseña
  const evaluatePasswordStrength = (password: string) => {
    let score = 0;
    let label = "Muy débil";
    let color = "bg-red-500";

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    switch (score) {
      case 0:
      case 1:
        label = "Muy débil";
        color = "bg-red-500";
        break;
      case 2:
        label = "Débil";
        color = "bg-orange-500";
        break;
      case 3:
        label = "Regular";
        color = "bg-yellow-500";
        break;
      case 4:
        label = "Fuerte";
        color = "bg-blue-500";
        break;
      case 5:
        label = "Muy fuerte";
        color = "bg-green-500";
        break;
    }

    return { score, label, color };
  };

  const handlePasswordChange = (password: string) => {
    setPasswordStrength(evaluatePasswordStrength(password));
  };

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) return;

    setMessage(null);

    resetPassword(
      {
        json: {
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        },
      },
      {
        onSuccess: (result) => {
          setMessage({
            type: "success",
            text: "Contraseña actualizada correctamente",
          });

          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            router.push("/sign-in?message=password-reset-success");
          }, 3000);
        },
        onError: (error) => {
          setMessage({
            type: "error",
            text: error.message || "Error interno del servidor",
          });
        },
      },
    );
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-2 text-center pb-8 px-8">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <Key className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Nueva contraseña
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Ingresa tu nueva contraseña segura
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 px-8 pb-8">
            {message && (
              <Alert
                className={
                  message.type === "error"
                    ? "border-red-200 bg-red-50"
                    : "border-green-200 bg-green-50"
                }
              >
                <AlertCircle
                  className={`h-4 w-4 ${message.type === "error" ? "text-red-600" : "text-green-600"}`}
                />
                <AlertDescription
                  className={
                    message.type === "error" ? "text-red-700" : "text-green-700"
                  }
                >
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 text-base font-medium">
                        Nueva contraseña
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Ingresa tu nueva contraseña"
                            type={showPassword ? "text" : "password"}
                            disabled={loading}
                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10 text-base"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handlePasswordChange(e.target.value);
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>

                      {field.value && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 font-medium">
                              Fortaleza:
                            </span>
                            <span
                              className={`font-semibold ${
                                passwordStrength.score <= 1
                                  ? "text-red-600"
                                  : passwordStrength.score <= 2
                                    ? "text-orange-600"
                                    : passwordStrength.score <= 3
                                      ? "text-yellow-600"
                                      : passwordStrength.score <= 4
                                        ? "text-blue-600"
                                        : "text-green-600"
                              }`}
                            >
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{
                                width: `${(passwordStrength.score / 5) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 text-base font-medium">
                        Confirmar contraseña
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Confirma tu nueva contraseña"
                            type={showConfirmPassword ? "text" : "password"}
                            disabled={loading}
                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10 text-base"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            disabled={loading}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-base text-gray-600 space-y-3 bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold">Tu contraseña debe contener:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-3">
                      <CheckCircle
                        className={`h-4 w-4 ${
                          form.watch("password")?.length >= 8
                            ? "text-green-500"
                            : "text-gray-300"
                        }`}
                      />
                      <span>Al menos 8 caracteres</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle
                        className={`h-4 w-4 ${
                          /[A-Z]/.test(form.watch("password") || "")
                            ? "text-green-500"
                            : "text-gray-300"
                        }`}
                      />
                      <span>Una letra mayúscula</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle
                        className={`h-4 w-4 ${
                          /[a-z]/.test(form.watch("password") || "")
                            ? "text-green-500"
                            : "text-gray-300"
                        }`}
                      />
                      <span>Una letra minúscula</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle
                        className={`h-4 w-4 ${
                          /\d/.test(form.watch("password") || "")
                            ? "text-green-500"
                            : "text-gray-300"
                        }`}
                      />
                      <span>Un número</span>
                    </li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={loading || passwordStrength.score < 3}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors text-base"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Actualizando contraseña...
                    </>
                  ) : (
                    <>
                      <Key className="h-5 w-5 mr-2" />
                      Actualizar contraseña
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="text-center">
              <Link
                href="/sign-in"
                className="text-base text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
