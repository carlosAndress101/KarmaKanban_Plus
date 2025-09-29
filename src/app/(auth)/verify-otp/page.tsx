"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
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
import { AlertCircle, Shield, ArrowLeft, Clock, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useVerifyOtp } from "@/features/auth/api/use-verify-otp";
import { useResendOtp } from "@/features/auth/api/use-resend-otp";

const verifyOtpSchema = z.object({
  otp: z.string().length(6, "OTP code must be 6 digits"),
});

type VerifyOtpForm = z.infer<typeof verifyOtpSchema>;

interface VerifyOtpSuccess {
  success: boolean;
  message: string;
  resetToken: string;
}

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  const { mutate: verifyOtp, isPending: loading } = useVerifyOtp();
  const { mutate: resendOtp, isPending: resendLoading } = useResendOtp();

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const form = useForm<VerifyOtpForm>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.push("/forgot-password");
    }
  }, [email, router]);

  // Timer
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = form.getValues("otp").split("");
    newOtp[index] = value;

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    form.setValue("otp", newOtp.join(""));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (data: VerifyOtpForm) => {
    if (!email) return;

    setMessage(null);

    verifyOtp(
      {
        json: {
          email,
          otp: data.otp,
        },
      },
      {
        onSuccess: (result) => {
          setMessage({
            type: "success",
            text: "Code verified successfully",
          });

          // Redirect to reset-password with token
          setTimeout(() => {
            const response = result as VerifyOtpSuccess;
            router.push(`/reset-password?token=${response.resetToken}`);
          }, 1500);
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

  const handleResend = async () => {
    if (!email || !canResend) return;

    setMessage(null);

    resendOtp(
      { json: { email } },
      {
        onSuccess: () => {
          setMessage({
            type: "success",
            text: "New code sent to your email",
          });

          setTimeRemaining(600); // Reset timer
          setCanResend(false);
          form.setValue("otp", "");
        },
        onError: (error) => {
          setMessage({
            type: "error",
            text: error.message || "Error resending code",
          });
        },
      }
    );
  };

  if (!email) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border border-gray-200 bg-white">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Verify code
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter the 6-digit code sent to
              <br />
              <span className="font-medium text-blue-600">{email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {message && (
              <Alert
                className={
                  message.type === "error"
                    ? "border-red-200 bg-red-50"
                    : "border-green-200 bg-green-50"
                }
              >
                <AlertCircle
                  className={`h-4 w-4 ${
                    message.type === "error" ? "text-red-600" : "text-green-600"
                  }`}
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

            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-full border">
                <Clock className="h-4 w-4" />
                <span className="font-medium">
                  {timeRemaining > 0
                    ? `Expires in ${formatTime(timeRemaining)}`
                    : "Code expired"}
                </span>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 text-center block font-medium">
                        Verification code
                      </FormLabel>
                      <FormControl>
                        <div className="flex justify-center space-x-2">
                          {[0, 1, 2, 3, 4, 5].map((index) => (
                            <Input
                              key={index}
                              ref={(el) => {
                                inputRefs.current[index] = el;
                              }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={field.value[index] || ""}
                              onChange={(e) => {
                                const value = (
                                  e.target as HTMLInputElement
                                ).value.replace(/\D/g, "");
                                handleOtpChange(value, index);
                              }}
                              onKeyDown={(e) => handleKeyDown(e, index)}
                              disabled={loading}
                              className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all duration-200"
                            />
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loading || form.getValues("otp").length !== 6}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Verify code
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Didn&apos;t receive the code?
              </p>

              <Button
                variant="outline"
                onClick={handleResend}
                disabled={!canResend || resendLoading}
                className="w-full h-11 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 bg-transparent cursor-pointer"
              >
                {resendLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2" />
                    Resending...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {canResend
                      ? "Resend code"
                      : `Resend in ${formatTime(timeRemaining)}`}
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <Link
                href="/forgot-password"
                className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Change email
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
