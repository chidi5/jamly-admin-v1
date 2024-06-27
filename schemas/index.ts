import { z } from "zod";

export const NewPasswordSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must have more than 6 characters"),
});

export const ResetSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
});

export const SignInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
  code: z.optional(z.string()),
});

export const SignUpSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(255),
  last_name: z.string().min(1, "Last name is required").max(255),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must have more than 6 characters"),
  token: z.optional(z.string()),
});
