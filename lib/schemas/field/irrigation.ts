import * as z from "zod";
import {
  optionalRemarksSchema,
  optionalUrlSchema,
  requiredDateSchema,
} from "@/lib/schemas/field/shared";

export const fieldIrrigationFormSchema = z.object({
  irrigatedAt: requiredDateSchema,
  cycleNumber: z
    .number()
    .int("Cycle number must be a whole number")
    .positive("Cycle number must be greater than 0"),
  imageUrl: optionalUrlSchema,
  remarks: optionalRemarksSchema,
});

export const createFieldIrrigationSchema = fieldIrrigationFormSchema.extend({
  fieldId: z.string().min(1, "Field is required"),
});

export const updateFieldIrrigationSchema = fieldIrrigationFormSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type FieldIrrigationFormInput = z.infer<typeof fieldIrrigationFormSchema>;
export type CreateFieldIrrigationInput = z.infer<
  typeof createFieldIrrigationSchema
>;
export type UpdateFieldIrrigationInput = z.infer<
  typeof updateFieldIrrigationSchema
>;

export function normalizeFieldIrrigationInput(input: FieldIrrigationFormInput) {
  return {
    irrigatedAt: input.irrigatedAt,
    cycleNumber: input.cycleNumber,
    imageUrl: input.imageUrl?.trim() || null,
    remarks: input.remarks?.trim() || null,
  };
}
