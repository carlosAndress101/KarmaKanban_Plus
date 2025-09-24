import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(3),
    lastName: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerSchemaRest = z.object({
  name: z.string().min(3),
  lastName: z.string().min(3),
  email: z.string().email(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP code must be 6 digits"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
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
