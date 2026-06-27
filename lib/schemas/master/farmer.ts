import * as z from "zod";
import {
  isValidFamilyMemberAccountNumber,
  isWholeNumberAccountNumber,
} from "@/lib/master/farmer-family";

const optionalText = z.string().trim().max(200).optional().or(z.literal(""));

const accountNumberSchema = z
  .string()
  .trim()
  .min(1, "Account number is required")
  .max(50)
  .refine(
    isWholeNumberAccountNumber,
    "Account number must be a whole number.",
  );

export const farmerKindSchema = z.enum([
  "individual",
  "family_head",
  "family_member",
]);

const farmerBaseSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  accountNumber: accountNumberSchema,
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
  farmerKind: farmerKindSchema,
  familyId: z.string().optional().or(z.literal("")),
});

function refineFarmerKind(
  data: z.infer<typeof farmerBaseSchema>,
  ctx: z.RefinementCtx,
  familyAccountNumber?: string | null,
) {
  const familyId = data.familyId?.trim() ? data.familyId.trim() : undefined;

  if (data.farmerKind === "individual") {
    if (familyId) {
      ctx.addIssue({
        code: "custom",
        message: "Individual farmers cannot belong to a family.",
        path: ["familyId"],
      });
    }
    return;
  }

  if (data.farmerKind === "family_head") {
    if (familyId) {
      ctx.addIssue({
        code: "custom",
        message: "Family primary accounts cannot select an existing family.",
        path: ["familyId"],
      });
    }
    return;
  }

  if (!familyId) {
    ctx.addIssue({
      code: "custom",
      message: "Select a family for this member.",
      path: ["familyId"],
    });
    return;
  }

  if (familyAccountNumber) {
    if (
      !isValidFamilyMemberAccountNumber(
        data.accountNumber,
        familyAccountNumber,
      )
    ) {
      ctx.addIssue({
        code: "custom",
        message: `Member account number must be a whole number different from the family account (${familyAccountNumber}).`,
        path: ["accountNumber"],
      });
    }
  }
}

export const farmerFormSchema = farmerBaseSchema.superRefine((data, ctx) => {
  refineFarmerKind(data, ctx);
});

export const createFarmerSchema = farmerBaseSchema.superRefine((data, ctx) => {
  refineFarmerKind(data, ctx);
});

export const updateFarmerSchema = farmerBaseSchema
  .extend({
    id: z.string().min(1, "ID is required"),
  })
  .superRefine((data, ctx) => {
    refineFarmerKind(data, ctx);
  });

export type FarmerFormInput = z.infer<typeof farmerFormSchema>;
export type CreateFarmerInput = z.infer<typeof createFarmerSchema>;
export type UpdateFarmerInput = z.infer<typeof updateFarmerSchema>;

function emptyToUndefined(value: string | undefined) {
  return value?.trim() ? value.trim() : undefined;
}

export function normalizeFarmerInput<T extends FarmerFormInput>(input: T) {
  const familyId = emptyToUndefined(input.familyId);

  return {
    ...input,
    familyId: input.farmerKind === "individual" ? undefined : familyId,
    panCardNumber: emptyToUndefined(input.panCardNumber)?.toUpperCase(),
    bankAccountName: emptyToUndefined(input.bankAccountName),
    bankName: emptyToUndefined(input.bankName),
    bankAccountNumber: emptyToUndefined(input.bankAccountNumber),
    bankIfscCode: emptyToUndefined(input.bankIfscCode)?.toUpperCase(),
    bankBranchName: emptyToUndefined(input.bankBranchName),
    contractUrl: emptyToUndefined(input.contractUrl),
  };
}

export function validateFarmerKindWithFamilyAccount(
  input: FarmerFormInput,
  familyAccountNumber?: string | null,
) {
  const issues: z.ZodIssue[] = [];
  const ctx = {
    addIssue: (issue: z.ZodIssue) => {
      issues.push(issue);
    },
  } as unknown as z.RefinementCtx;

  refineFarmerKind(input, ctx, familyAccountNumber);

  if (issues.length > 0) {
    return {
      success: false as const,
      error: new z.ZodError(issues),
    };
  }

  return { success: true as const, data: input };
}
