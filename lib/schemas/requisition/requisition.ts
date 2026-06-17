import * as z from "zod";

const optionalDecimal = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (value) => !value || /^\d+(\.\d{1,2})?$/.test(value),
    "Enter a valid number with up to 2 decimal places",
  );

const requiredDate = z
  .string()
  .trim()
  .min(1, "Date is required")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date");

export const requisitionFormSchema = z.object({
  farmerId: z.string().min(1, "Farmer is required"),
  varietyId: z.string().min(1, "Variety is required"),
  requisitionDate: requiredDate,
  requestedDeliveryDate: requiredDate,
  acres: optionalDecimal,
  quantity: optionalDecimal,
});

export const createRequisitionSchema = requisitionFormSchema;
export const updateRequisitionSchema = requisitionFormSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type RequisitionFormInput = z.infer<typeof requisitionFormSchema>;
export type CreateRequisitionInput = z.infer<typeof createRequisitionSchema>;
export type UpdateRequisitionInput = z.infer<typeof updateRequisitionSchema>;

export const rejectRequisitionSchema = z.object({
  id: z.string().min(1, "ID is required"),
  rejectionRemarks: z
    .string()
    .trim()
    .min(3, "Rejection remarks must be at least 3 characters"),
});

export type RejectRequisitionInput = z.infer<typeof rejectRequisitionSchema>;

export const approveRequisitionSchema = z.object({
  id: z.string().min(1, "ID is required"),
  approvedDeliveryDate: requiredDate,
});

export type ApproveRequisitionInput = z.infer<typeof approveRequisitionSchema>;

function emptyToUndefined(value: string | undefined) {
  return value?.trim() ? value.trim() : undefined;
}

export function normalizeRequisitionInput<T extends RequisitionFormInput>(
  input: T,
) {
  return {
    ...input,
    acres: emptyToUndefined(input.acres),
    quantity: emptyToUndefined(input.quantity),
  };
}
