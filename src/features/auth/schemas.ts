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

export const forgotPasswordSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "El código OTP debe tener 6 dígitos"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token requerido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
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
