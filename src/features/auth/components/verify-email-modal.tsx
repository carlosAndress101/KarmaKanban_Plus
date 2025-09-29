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
  otp: z.string().length(6, "Code must be 6 digits"),
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
            Email Verification
          </DialogTitle>
          <DialogDescription>
            {isEmailVerified
              ? "Your email is already verified."
              : "Verify your email address for enhanced security."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {isEmailVerified ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your email <strong>{userEmail}</strong> is successfully
                verified.
              </AlertDescription>
            </Alert>
          ) : emailSent ? (
            <div className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  A verification code has been sent to{" "}
                  <strong>{userEmail}</strong>. Enter the 6-digit code to verify
                  your email.
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
                        <FormLabel>Verification Code</FormLabel>
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
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isVerifying}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Verify
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
                  Your email <strong>{userEmail}</strong> is not verified. We
                  will send you a verification code to confirm your identity.
                </AlertDescription>
              </Alert>

              <div className="text-sm text-muted-foreground">
                <p>By verifying your email you will be able to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Recover your password if you forget it</li>
                  <li>Receive important notifications</li>
                  <li>Increase your account security</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {!emailSent && (
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              {isEmailVerified ? "Close" : "Later"}
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
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Verification
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
