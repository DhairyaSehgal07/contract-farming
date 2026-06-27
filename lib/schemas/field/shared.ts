import * as z from "zod";

export const optionalRemarksSchema = z.string().trim().optional();

export const optionalResultSchema = z.string().trim().optional();

export const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => !value || value === "" || z.string().url().safeParse(value).success,
    "Enter a valid URL",
  );

export const requiredDateSchema = z
  .string()
  .trim()
  .min(1, "Date is required")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date");

export const requiredPositiveDecimal = z
  .string()
  .trim()
  .min(1, "Value is required")
  .refine(
    (value) => /^\d+(\.\d{1,2})?$/.test(value),
    "Enter a valid number with up to 2 decimal places",
  )
  .refine(
    (value) => Number.parseFloat(value) > 0,
    "Value must be greater than 0",
  );

export const fieldActivityRoundSchema = z.enum(["FIRST", "SECOND"]);

export type FieldActivityRound = z.infer<typeof fieldActivityRoundSchema>;

export function normalizeOptionalText(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed === "" || trimmed === undefined ? null : trimmed;
}

export function normalizeOptionalUrl(value: string | undefined) {
  return normalizeOptionalText(value);
}
