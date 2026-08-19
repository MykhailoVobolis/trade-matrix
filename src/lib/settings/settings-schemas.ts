import { z } from "zod";

export const generalSettingsSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must contain at least 2 characters."),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must contain at least 2 characters."),
  email: z.email("Enter a valid email address.").trim(),
});

export type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;
