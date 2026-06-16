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

const requiredPositiveDecimal = z
  .string()
  .trim()
  .min(1, "Quantity is required")
  .refine(
    (value) => /^\d+(\.\d{1,2})?$/.test(value),
    "Enter a valid number with up to 2 decimal places",
  )
  .refine((value) => Number.parseFloat(value) > 0, "Quantity must be greater than 0");

const requiredDate = z
  .string()
  .trim()
  .min(1, "Date is required")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date");

const optionalDate = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
    "Enter a valid date",
  );

const optionalId = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""));

const optionalString = z.string().trim().optional().or(z.literal(""));

export const dispatchSizeLineSchema = z.object({
  sizeId: z.string().min(1, "Size is required"),
  quantity: requiredPositiveDecimal,
});

export const dispatchRequisitionSelectionSchema = z.object({
  requisitionId: z.string().min(1, "Requisition is required"),
  sizeLines: z
    .array(dispatchSizeLineSchema)
    .min(1, "At least one size line is required"),
});

export const createDispatchSchema = z.object({
  requisitions: z
    .array(dispatchRequisitionSelectionSchema)
    .min(1, "Select at least one requisition"),
  dispatchDate: requiredDate,
  dateOfReceiving: optionalDate,
  generationId: z.string().min(1, "Generation is required"),
  locationId: optionalId,
  toLocationId: optionalId,
  truckNumber: z.string().trim().min(1, "Truck number is required"),
  manualGatePassNumber: optionalString,
  driverMobileNumber: optionalString,
  grossWeight: optionalDecimal,
  tareWeight: optionalDecimal,
  netWeight: optionalDecimal,
  averageWeightPerBag: optionalDecimal,
  remarks: optionalString,
});

export type DispatchSizeLineInput = z.infer<typeof dispatchSizeLineSchema>;
export type DispatchRequisitionSelectionInput = z.infer<
  typeof dispatchRequisitionSelectionSchema
>;
export type CreateDispatchInput = z.infer<typeof createDispatchSchema>;

function emptyToUndefined(value: string | undefined) {
  return value?.trim() ? value.trim() : undefined;
}

function decimalToNumber(value: string | undefined) {
  const normalized = emptyToUndefined(value);
  return normalized ? Number.parseFloat(normalized) : undefined;
}

export function normalizeCreateDispatchInput(input: CreateDispatchInput) {
  return {
    ...input,
    dateOfReceiving: emptyToUndefined(input.dateOfReceiving),
    locationId: emptyToUndefined(input.locationId),
    toLocationId: emptyToUndefined(input.toLocationId),
    manualGatePassNumber: emptyToUndefined(input.manualGatePassNumber),
    driverMobileNumber: emptyToUndefined(input.driverMobileNumber),
    grossWeight: decimalToNumber(input.grossWeight),
    tareWeight: decimalToNumber(input.tareWeight),
    netWeight: decimalToNumber(input.netWeight),
    averageWeightPerBag: decimalToNumber(input.averageWeightPerBag),
    remarks: emptyToUndefined(input.remarks),
    requisitions: input.requisitions.map((selection) => ({
      requisitionId: selection.requisitionId,
      sizeLines: selection.sizeLines.map((line) => ({
        sizeId: line.sizeId,
        quantity: Number.parseFloat(line.quantity),
      })),
    })),
  };
}

export type NormalizedCreateDispatchInput = ReturnType<
  typeof normalizeCreateDispatchInput
>;
