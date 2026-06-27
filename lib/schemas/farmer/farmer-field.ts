import * as z from "zod";

const requiredDecimal = z
  .string()
  .trim()
  .min(1, "Acres is required")
  .refine(
    (value) => /^\d+(\.\d{1,2})?$/.test(value),
    "Enter a valid number with up to 2 decimal places",
  )
  .refine((value) => Number.parseFloat(value) > 0, "Acres must be greater than 0");

export const farmerFieldFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  geoLocation: z.string().trim().min(1, "Geo location is required"),
  acres: requiredDecimal,
});

export const createFarmerFieldSchema = farmerFieldFormSchema.extend({
  farmerId: z.string().min(1, "Farmer is required"),
});

export const updateFarmerFieldSchema = farmerFieldFormSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type FarmerFieldFormInput = z.infer<typeof farmerFieldFormSchema>;
export type CreateFarmerFieldInput = z.infer<typeof createFarmerFieldSchema>;
export type UpdateFarmerFieldInput = z.infer<typeof updateFarmerFieldSchema>;

export function normalizeFarmerFieldInput(input: FarmerFieldFormInput) {
  return {
    name: input.name.trim(),
    geoLocation: input.geoLocation.trim(),
    acres: input.acres.trim(),
  };
}
