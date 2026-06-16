import * as z from "zod";

export const localityNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be at most 100 characters");

export const createLocalitySchema = z.object({
  name: localityNameSchema,
  stationId: z.string().min(1, "Station is required"),
});

export const updateLocalitySchema = createLocalitySchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type CreateLocalityInput = z.infer<typeof createLocalitySchema>;
export type UpdateLocalityInput = z.infer<typeof updateLocalitySchema>;
