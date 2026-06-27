import * as z from "zod";
import {
  optionalRemarksSchema,
  optionalUrlSchema,
  requiredDateSchema,
  requiredPositiveDecimal,
} from "@/lib/schemas/field/shared";

export const fieldPlantationFormSchema = z.object({
  varietyId: z.string().min(1, "Variety is required"),
  sizeId: z.string().min(1, "Size is required"),
  plantedAt: requiredDateSchema,
  bagCount: requiredPositiveDecimal,
  acresPlanted: requiredPositiveDecimal,
  imageUrl: optionalUrlSchema,
  remarks: optionalRemarksSchema,
});

export const createFieldPlantationSchema = fieldPlantationFormSchema.extend({
  fieldId: z.string().min(1, "Field is required"),
});

export const updateFieldPlantationSchema = fieldPlantationFormSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type FieldPlantationFormInput = z.infer<typeof fieldPlantationFormSchema>;
export type CreateFieldPlantationInput = z.infer<
  typeof createFieldPlantationSchema
>;
export type UpdateFieldPlantationInput = z.infer<
  typeof updateFieldPlantationSchema
>;

export function normalizeFieldPlantationInput(input: FieldPlantationFormInput) {
  return {
    varietyId: input.varietyId,
    sizeId: input.sizeId,
    plantedAt: input.plantedAt,
    bagCount: input.bagCount.trim(),
    acresPlanted: input.acresPlanted.trim(),
    imageUrl: input.imageUrl?.trim() || null,
    remarks: input.remarks?.trim() || null,
  };
}
