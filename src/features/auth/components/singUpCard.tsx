"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";
import { z } from "zod";
import { registerSchema } from "@/features/auth/schemas";
import { useRegister } from "@/features/auth/api/use-register";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  renderConfirmPasswordField,
  renderEmailField,
  renderLastNameField,
  renderNameField,
  renderPasswordField,
} from "../custom/RegisterFormFields";

const RegisterForm = () => {
  const { mutate, isPending } = useRegister();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    mutate({ json: values });
  };

  return (
    <Card className="w-full h-full md:w-[487px] border-none shadow-none">
      <CardHeader className="flex items-center justify-center text-center">
        <CardTitle className="text-xl">Sing-Up</CardTitle>
      </CardHeader>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="px-7">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="name"
              control={form.control}
              render={renderNameField}
            />
            <FormField
              name="lastName"
              control={form.control}
              render={renderLastNameField}
            />
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
            <FormField
              name="confirmPassword"
              control={form.control}
              render={renderConfirmPasswordField}
            />
            <Button disabled={isPending} size="lg" className="w-full">
              Register
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
