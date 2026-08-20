import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Enter a valid email address.").trim(),
  password: z.string().min(8, "Password must contain at least 8 characters."),
});

export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must contain at least 2 characters."),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must contain at least 2 characters."),
  email: z.email("Enter a valid email address.").trim(),
  password: z.string().min(8, "Password must contain at least 8 characters."),
  terms: z.boolean().refine((value) => value, {
    message: "You must accept the terms to create an account.",
  }),
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address.").trim(),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must contain at least 8 characters."),
    confirmPassword: z
      .string()
      .min(8, "Password must contain at least 8 characters."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const verifyCodeSchema = z.object({
  code: z
    .string()
    .regex(/^\d{6}$/, "Enter the complete 6-digit verification code."),
});

export type VerifyCodeValues = z.infer<typeof verifyCodeSchema>;
