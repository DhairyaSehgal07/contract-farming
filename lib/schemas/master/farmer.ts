import * as z from "zod";

const optionalText = z.string().trim().max(200).optional().or(z.literal(""));

export const farmerFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  accountNumber: z.string().trim().min(1, "Account number is required").max(50),
  mobileNumber: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  aadharNumber: z
    .string()
    .trim()
    .regex(/^\d{12}$/, "Aadhaar number must be 12 digits"),
  panCardNumber: z
    .string()
    .trim()
    .regex(/^[A-Z]{5}\d{4}[A-Z]$/i, "Enter a valid PAN number")
    .optional()
    .or(z.literal("")),
  bankAccountName: optionalText,
  bankName: optionalText,
  bankAccountNumber: optionalText,
  bankIfscCode: optionalText,
  bankBranchName: optionalText,
  contractUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  stationId: z.string().min(1, "Station is required"),
  localityId: z.string().min(1, "Locality is required"),
});

export const createFarmerSchema = farmerFormSchema;
export const updateFarmerSchema = farmerFormSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type FarmerFormInput = z.infer<typeof farmerFormSchema>;
export type CreateFarmerInput = z.infer<typeof createFarmerSchema>;
export type UpdateFarmerInput = z.infer<typeof updateFarmerSchema>;

function emptyToUndefined(value: string | undefined) {
  return value?.trim() ? value.trim() : undefined;
}

export function normalizeFarmerInput<T extends FarmerFormInput>(input: T) {
  return {
    ...input,
    panCardNumber: emptyToUndefined(input.panCardNumber)?.toUpperCase(),
    bankAccountName: emptyToUndefined(input.bankAccountName),
    bankName: emptyToUndefined(input.bankName),
    bankAccountNumber: emptyToUndefined(input.bankAccountNumber),
    bankIfscCode: emptyToUndefined(input.bankIfscCode)?.toUpperCase(),
    bankBranchName: emptyToUndefined(input.bankBranchName),
    contractUrl: emptyToUndefined(input.contractUrl),
  };
}
