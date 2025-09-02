import { FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { registerSchema } from "@/features/auth/schemas";

export function renderNameField({
  field,
}: {
  field: ControllerRenderProps<z.infer<typeof registerSchema>, "name">;
}) {
  return (
    <FormItem>
      <FormControl>
        <Input {...field} type="text" placeholder="Introduzca su nombre" />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
export function renderLastNameField({
  field,
}: {
  field: ControllerRenderProps<z.infer<typeof registerSchema>, "lastName">;
}) {
  return (
    <FormItem>
      <FormControl>
        <Input {...field} type="text" placeholder="Introduzca sus apellidos" />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
export function renderEmailField({
  field,
}: {
  field: ControllerRenderProps<z.infer<typeof registerSchema>, "email">;
}) {
  return (
    <FormItem>
      <FormControl>
        <Input {...field} type="email" placeholder="Introduzca su correo" />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
export function renderPasswordField({
  field,
}: {
  field: ControllerRenderProps<z.infer<typeof registerSchema>, "password">;
}) {
  return (
    <FormItem>
      <FormControl>
        <Input
          {...field}
          type="password"
          placeholder="Introduzca su contraseña"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
export function renderConfirmPasswordField({
  field,
}: {
  field: ControllerRenderProps<
    z.infer<typeof registerSchema>,
    "confirmPassword"
  >;
}) {
  return (
    <FormItem>
      <FormControl>
        <Input
          {...field}
          type="password"
          placeholder="Confirme su contraseña"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
