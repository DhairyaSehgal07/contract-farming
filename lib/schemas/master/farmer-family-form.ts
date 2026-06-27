import * as z from "zod";
import { isWholeNumberAccountNumber } from "@/lib/master/farmer-family";

export const farmerFamilyFormSchema = z.object({
  accountNumber: z
    .string()
    .trim()
    .min(1, "Account number is required")
    .max(50)
    .refine(
      isWholeNumberAccountNumber,
      "Account number must be a whole number.",
    ),
  name: z.string().trim().min(1, "Name is required").max(200),
  stationId: z.string().min(1, "Station is required"),
  localityId: z.string().min(1, "Locality is required"),
});

export const createFarmerFamilySchema = farmerFamilyFormSchema;
export const updateFarmerFamilySchema = farmerFamilyFormSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type FarmerFamilyFormInput = z.infer<typeof farmerFamilyFormSchema>;
export type CreateFarmerFamilyInput = z.infer<typeof createFarmerFamilySchema>;
export type UpdateFarmerFamilyInput = z.infer<typeof updateFarmerFamilySchema>;
