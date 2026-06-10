import * as z from "zod";

export const stationNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be at most 100 characters");

export const createStationSchema = z.object({
  name: stationNameSchema,
});

export const updateStationSchema = createStationSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type CreateStationInput = z.infer<typeof createStationSchema>;
export type UpdateStationInput = z.infer<typeof updateStationSchema>;
