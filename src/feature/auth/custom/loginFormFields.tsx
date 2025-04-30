import { FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { loginSchema } from "@/feature/auth/schemas";

export function renderEmailField({ field }: { field: ControllerRenderProps<z.infer<typeof loginSchema>, "email"> }) {
  return (
    <FormItem>
      <FormControl>
        <Input
          {...field}
          type="email"
          placeholder="Introduzca su correo"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

export function renderPasswordField({ field }: { field: ControllerRenderProps<z.infer<typeof loginSchema>, "password"> }) {
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

