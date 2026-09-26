import { z } from "zod";

// Shared schema used by both the client form and the API route so validation
// stays consistent on both sides.
export const willingnessToPayValues = ["Yes", "Maybe", "No"] as const;

const optionalTrimmed = z
  .string()
  .trim()
  .max(2000, "Please keep this under 2000 characters.")
  .optional()
  .or(z.literal(""));

export const earlyAccessSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, "Please enter your name.")
    .max(120, "Please keep your name under 120 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address."),
  preparing_status: optionalTrimmed,
  test_date: optionalTrimmed,
  current_practice_method: optionalTrimmed,
  hardest_part: optionalTrimmed,
  willingness_to_pay: z.enum(willingnessToPayValues, {
    message: "Please choose Yes, Maybe, or No.",
  }),
  notes: optionalTrimmed,
});

export type EarlyAccessInput = z.infer<typeof earlyAccessSchema>;
