"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { AlertCircle, Mail, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForgotPassword } from "@/features/auth/api/use-forgot-password";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const { mutate: forgotPassword, isPending: loading } = useForgotPassword();

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setMessage(null);

    forgotPassword(
      { json: data },
      {
        onSuccess: () => {
          setMessage({
            type: "success",
            text: "Verification code sent to your email",
          });

          // Redirect to verification page after 2 seconds
          setTimeout(() => {
            router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
          }, 2000);
        },
        onError: (error) => {
          setMessage({
            type: "error",
            text: error.message || "Internal server error",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl border-0 rounded-3xl overflow-hidden bg-white">
          <CardHeader className="space-y-4 text-center pb-6 px-12 pt-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Mail className="h-8 w-8 text-white" />
            </div>

            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-gray-900">
                Forgot your password?
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
                Don&apos;t worry, we&apos;ll send you a verification code to
                recover your account
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-12 pb-8">
            {message && (
              <Alert
                className={`border-0 rounded-xl ${
                  message.type === "error"
                    ? "bg-gradient-to-r from-red-50 to-rose-50 shadow-lg shadow-red-100/50"
                    : "bg-gradient-to-r from-emerald-50 to-green-50 shadow-lg shadow-green-100/50"
                }`}
              >
                <AlertCircle
                  className={`h-5 w-5 ${
                    message.type === "error"
                      ? "text-red-500"
                      : "text-emerald-500"
                  }`}
                />
                <AlertDescription
                  className={`font-medium ${
                    message.type === "error"
                      ? "text-red-700"
                      : "text-emerald-700"
                  }`}
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
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-gray-700 font-semibold text-base">
                        Email address
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="your@email.com"
                            type="email"
                            disabled={loading}
                            className="h-14 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 pl-12 bg-white"
                            {...field}
                          />
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 font-medium" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-300 text-base rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
                      Sending code...
                    </>
                  ) : (
                    <>
                      <Mail className="h-5 w-5 mr-3" />
                      Send verification code
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="space-y-4 pt-2">
              <div className="text-center">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center text-base text-gray-600 hover:text-blue-600 transition-colors duration-300 font-medium group"
                >
                  <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                  Back to sign in
                </Link>
              </div>

              <div className="text-center border-t border-gray-200 pt-4">
                <p className="text-gray-500 mb-2">
                  Don&apos;t have an account?
                </p>
                <Link
                  href="/sign-up"
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-300 hover:underline"
                >
                  Sign up here
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
