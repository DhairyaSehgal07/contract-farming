import * as z from "zod";
import {
  fieldActivityRoundSchema,
  optionalRemarksSchema,
  optionalResultSchema,
  optionalUrlSchema,
  requiredDateSchema,
} from "@/lib/schemas/field/shared";

export const fieldInspectionFormSchema = z.object({
  activityDate: requiredDateSchema,
  result: optionalResultSchema,
  remarks: optionalRemarksSchema,
  imageUrl: optionalUrlSchema,
});

export const createFieldDehaulmingSchema = fieldInspectionFormSchema.extend({
  fieldId: z.string().min(1, "Field is required"),
  round: fieldActivityRoundSchema,
});

export const updateFieldDehaulmingSchema = fieldInspectionFormSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export const createFieldRougingSchema = fieldInspectionFormSchema.extend({
  fieldId: z.string().min(1, "Field is required"),
});

export const updateFieldRougingSchema = fieldInspectionFormSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export const createFieldStripTestSchema = fieldInspectionFormSchema.extend({
  fieldId: z.string().min(1, "Field is required"),
  round: fieldActivityRoundSchema,
});

export const updateFieldStripTestSchema = fieldInspectionFormSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export const createFieldHarvestSchema = fieldInspectionFormSchema.extend({
  fieldId: z.string().min(1, "Field is required"),
});

export const updateFieldHarvestSchema = fieldInspectionFormSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type FieldInspectionFormInput = z.infer<typeof fieldInspectionFormSchema>;
export type CreateFieldDehaulmingInput = z.infer<
  typeof createFieldDehaulmingSchema
>;
export type UpdateFieldDehaulmingInput = z.infer<
  typeof updateFieldDehaulmingSchema
>;
export type CreateFieldRougingInput = z.infer<typeof createFieldRougingSchema>;
export type UpdateFieldRougingInput = z.infer<typeof updateFieldRougingSchema>;
export type CreateFieldStripTestInput = z.infer<
  typeof createFieldStripTestSchema
>;
export type UpdateFieldStripTestInput = z.infer<
  typeof updateFieldStripTestSchema
>;
export type CreateFieldHarvestInput = z.infer<typeof createFieldHarvestSchema>;
export type UpdateFieldHarvestInput = z.infer<typeof updateFieldHarvestSchema>;

export function normalizeFieldInspectionInput(input: FieldInspectionFormInput) {
  return {
    activityDate: input.activityDate,
    result: input.result?.trim() || null,
    remarks: input.remarks?.trim() || null,
    imageUrl: input.imageUrl?.trim() || null,
  };
}
