import * as z from "zod";

export const stationNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be at most 100 characters");

export const createStationSchema = z.object({
  name: stationNameSchema,
  city: z.string().trim().max(100).optional().or(z.literal("")),
  state: z.string().trim().max(100).optional().or(z.literal("")),
});

export const updateStationSchema = createStationSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type CreateStationInput = z.infer<typeof createStationSchema>;
export type UpdateStationInput = z.infer<typeof updateStationSchema>;

function emptyToUndefined(value: string | undefined) {
  return value?.trim() ? value.trim() : undefined;
}

export function normalizeStationInput<
  T extends {
    city?: string;
    state?: string;
  },
>(input: T) {
  return {
    ...input,
    city: emptyToUndefined(input.city),
    state: emptyToUndefined(input.state),
  };
}
