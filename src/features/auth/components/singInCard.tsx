"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { useLogin } from "../api/use-login";
import { z } from "zod";
import { loginSchema } from "@/features/auth/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/ui/form";
import {
  renderEmailField,
  renderPasswordField,
} from "../custom/loginFormFields";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginForm() {
  const { mutate, isPending } = useLogin();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    mutate({ json: values });
  };

  return (
    <Card className="w-full h-full md:w-[487px] border-none shadow-none">
      <CardHeader className="flex items-center justify-center text-center">
        <CardTitle className="text-2xl font-bold"> KarmaKanban </CardTitle>
      </CardHeader>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="px-7">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="email"
              control={form.control}
              render={renderEmailField}
            />
            <FormField
              name="password"
              control={form.control}
              render={renderPasswordField}
            />
            <Button disabled={isPending} size="lg" className="w-full">
              Login
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center">
          <Link href="/forgot-password">
            <span className="text-sm text-blue-700 hover:text-blue-800 underline">
              ¿Olvidaste tu contraseña?
            </span>
          </Link>
        </div>
      </CardContent>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7 flex items-center justify-center">
        <p>
          No tiene cuenta?{" "}
          <Link href="/sign-up">
            <span className="text-blue-700">&nbsp;Sign Up</span>
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
