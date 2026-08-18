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
});

export type SignUpValues = z.infer<typeof signUpSchema>;
