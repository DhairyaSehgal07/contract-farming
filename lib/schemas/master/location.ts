import * as z from "zod";

export const locationNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be at most 100 characters");

export const locationCategorySchema = z
  .string()
  .trim()
  .min(1, "Category is required")
  .max(100, "Category must be at most 100 characters");

export const createLocationSchema = z.object({
  name: locationNameSchema,
  category: locationCategorySchema,
});

export const updateLocationSchema = createLocationSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
