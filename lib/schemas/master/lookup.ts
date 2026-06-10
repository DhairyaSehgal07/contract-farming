import * as z from "zod";

export const lookupNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be at most 100 characters");

export const createLookupSchema = z.object({
  name: lookupNameSchema,
});

export const updateLookupSchema = createLookupSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type CreateLookupInput = z.infer<typeof createLookupSchema>;
export type UpdateLookupInput = z.infer<typeof updateLookupSchema>;
