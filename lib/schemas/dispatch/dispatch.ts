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
const optionalIntegerString = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || /^\d+$/.test(value), "Enter a valid number");

export const dispatchSizeLineSchema = z.object({
  sizeId: z.string().min(1, "Size is required"),
  generationId: z.string().min(1, "Generation is required"),
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
  locationId: optionalId,
  toLocation: optionalString,
  truckNumber: z
    .string()
    .trim()
    .min(1, "Truck number is required")
    .transform((value) => value.toUpperCase()),
  manualGatePassNumber: optionalString,
  weightSlipNumber: optionalIntegerString,
  driverMobileNumber: optionalString,
  grossWeight: optionalDecimal,
  tareWeight: optionalDecimal,
  netWeight: optionalDecimal,
  averageWeightPerBag: optionalDecimal,
  remarks: optionalString,
});

export const dispatchStep2Schema = createDispatchSchema.omit({
  requisitions: true,
  dateOfReceiving: true,
});

export const updateDispatchStep2Schema = dispatchStep2Schema.extend({
  id: z.string().min(1, "Dispatch is required"),
});

export const confirmLotReceiptSchema = z.object({
  lotId: z.string().min(1, "Lot is required"),
  otp: z
    .string()
    .trim()
    .min(6, "Enter the 6-digit OTP")
    .max(6, "Enter the 6-digit OTP")
    .regex(/^\d{6}$/, "Enter a valid 6-digit OTP"),
});

export const sendLotReceiptOtpSchema = z.object({
  lotId: z.string().min(1, "Lot is required"),
});

export type DispatchSizeLineInput = z.infer<typeof dispatchSizeLineSchema>;
export type DispatchRequisitionSelectionInput = z.infer<
  typeof dispatchRequisitionSelectionSchema
>;
export type CreateDispatchInput = z.infer<typeof createDispatchSchema>;
export type DispatchStep2Input = z.infer<typeof dispatchStep2Schema>;
export type UpdateDispatchStep2Input = z.infer<typeof updateDispatchStep2Schema>;
export type ConfirmLotReceiptInput = z.infer<typeof confirmLotReceiptSchema>;
export type SendLotReceiptOtpInput = z.infer<typeof sendLotReceiptOtpSchema>;

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
    truckNumber: input.truckNumber.trim().toUpperCase(),
    dateOfReceiving: emptyToUndefined(input.dateOfReceiving),
    locationId: emptyToUndefined(input.locationId),
    toLocation: emptyToUndefined(input.toLocation),
    manualGatePassNumber: emptyToUndefined(input.manualGatePassNumber),
    weightSlipNumber: emptyToUndefined(input.weightSlipNumber),
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
        generationId: line.generationId,
        quantity: Number.parseFloat(line.quantity),
      })),
    })),
  };
}

export function normalizeDispatchStep2Input(input: DispatchStep2Input) {
  return {
    ...input,
    truckNumber: input.truckNumber.trim().toUpperCase(),
    locationId: emptyToUndefined(input.locationId),
    toLocation: emptyToUndefined(input.toLocation),
    manualGatePassNumber: emptyToUndefined(input.manualGatePassNumber),
    weightSlipNumber: emptyToUndefined(input.weightSlipNumber),
    driverMobileNumber: emptyToUndefined(input.driverMobileNumber),
    grossWeight: decimalToNumber(input.grossWeight),
    tareWeight: decimalToNumber(input.tareWeight),
    netWeight: decimalToNumber(input.netWeight),
    averageWeightPerBag: decimalToNumber(input.averageWeightPerBag),
    remarks: emptyToUndefined(input.remarks),
  };
}

export function normalizeUpdateDispatchStep2Input(input: UpdateDispatchStep2Input) {
  const { id, ...rest } = input;
  return { id, ...normalizeDispatchStep2Input(rest) };
}

export type NormalizedCreateDispatchInput = ReturnType<
  typeof normalizeCreateDispatchInput
>;
