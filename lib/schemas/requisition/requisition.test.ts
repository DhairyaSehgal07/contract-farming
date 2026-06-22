import { describe, expect, it } from "vitest";
import { requisitionFormSchema } from "@/lib/schemas/requisition/requisition";

const baseInput = {
  farmerId: "farmer-1",
  varietyId: "variety-1",
  requisitionDate: "2026-06-01",
  requestedDeliveryDate: "2026-06-15",
};

describe("requisitionFormSchema", () => {
  it("requires exactly one of acres or bags", () => {
    expect(
      requisitionFormSchema.safeParse({
        ...baseInput,
        acres: "2",
        quantity: "",
      }).success,
    ).toBe(true);

    expect(
      requisitionFormSchema.safeParse({
        ...baseInput,
        acres: "",
        quantity: "60",
      }).success,
    ).toBe(true);

    expect(
      requisitionFormSchema.safeParse({
        ...baseInput,
        acres: "2",
        quantity: "60",
      }).success,
    ).toBe(false);

    expect(
      requisitionFormSchema.safeParse({
        ...baseInput,
        acres: "",
        quantity: "",
      }).success,
    ).toBe(false);
  });
});
