import * as z from "zod";
import { lookupNameSchema } from "@/lib/schemas/master/lookup";

const optionalPositiveInteger = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (value) => !value || /^\d+$/.test(value),
    "Enter a valid whole number",
  )
  .refine(
    (value) => !value || Number.parseInt(value, 10) > 0,
    "Must be greater than 0",
  );

export const sizeFormSchema = z.object({
  name: lookupNameSchema,
  bagsPerAcre: optionalPositiveInteger,
});

export const createSizeSchema = sizeFormSchema;
export const updateSizeSchema = sizeFormSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type SizeFormInput = z.infer<typeof sizeFormSchema>;
export type CreateSizeInput = z.infer<typeof createSizeSchema>;
export type UpdateSizeInput = z.infer<typeof updateSizeSchema>;

function emptyToNull(value: string | undefined): number | null {
  if (!value) return null;
  return Number.parseInt(value, 10);
}

export function toSizeCreateData(input: SizeFormInput) {
  return {
    name: input.name,
    bagsPerAcre: emptyToNull(input.bagsPerAcre),
  };
}

export function toSizeUpdateData(input: UpdateSizeInput) {
  return {
    id: input.id,
    name: input.name,
    bagsPerAcre: emptyToNull(input.bagsPerAcre),
  };
}
