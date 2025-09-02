import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const registerSchema = z
  .object({
    name: z.string().min(3),
    lastName: z.string().min(3),
    email: z.string().email(),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const registerSchemaRest = z.object({
  name: z.string().min(3),
  lastName: z.string().min(3),
  email: z.string().email(),
});

export type User = {
  id: string;
  email: string;
  name: string;
  lastName: string;
};

declare module "hono" {
  interface ContextVariableMap {
    user: User | null;
    authenticated: boolean;
  }
}
