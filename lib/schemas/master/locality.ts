import * as z from "zod";

export const localityNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be at most 100 characters");

export const createLocalitySchema = z.object({
  name: localityNameSchema,
  city: z.string().trim().max(100).optional().or(z.literal("")),
  state: z.string().trim().max(100).optional().or(z.literal("")),
  postalCode: z.string().trim().max(20).optional().or(z.literal("")),
  stationId: z.string().min(1, "Station is required"),
});

export const updateLocalitySchema = createLocalitySchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type CreateLocalityInput = z.infer<typeof createLocalitySchema>;
export type UpdateLocalityInput = z.infer<typeof updateLocalitySchema>;

function emptyToUndefined(value: string | undefined) {
  return value?.trim() ? value.trim() : undefined;
}

export function normalizeLocalityInput<
  T extends {
    city?: string;
    state?: string;
    postalCode?: string;
  },
>(input: T) {
  return {
    ...input,
    city: emptyToUndefined(input.city),
    state: emptyToUndefined(input.state),
    postalCode: emptyToUndefined(input.postalCode),
  };
}
