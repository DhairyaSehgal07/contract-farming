import { describe, expect, it } from "vitest";
import { fieldIrrigationFormSchema } from "@/lib/schemas/field/irrigation";
import { fieldPlantationFormSchema } from "@/lib/schemas/field/plantation";

describe("fieldPlantationFormSchema", () => {
  it("requires plantation fields", () => {
    const result = fieldPlantationFormSchema.safeParse({
      varietyId: "",
      sizeId: "",
      plantedAt: "",
      bagCount: "",
      acresPlanted: "",
    });

    expect(result.success).toBe(false);
  });

  it("accepts valid plantation input", () => {
    const result = fieldPlantationFormSchema.safeParse({
      varietyId: "variety-1",
      sizeId: "size-1",
      plantedAt: "2026-06-27",
      bagCount: "90",
      acresPlanted: "3",
      imageUrl: "https://example.com/image.jpg",
      remarks: "First planting",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid image URL", () => {
    const result = fieldPlantationFormSchema.safeParse({
      varietyId: "variety-1",
      sizeId: "size-1",
      plantedAt: "2026-06-27",
      bagCount: "90",
      acresPlanted: "3",
      imageUrl: "not-a-url",
    });

    expect(result.success).toBe(false);
  });
});

describe("fieldIrrigationFormSchema", () => {
  it("requires irrigation date and cycle number", () => {
    const result = fieldIrrigationFormSchema.safeParse({
      irrigatedAt: "",
      cycleNumber: 0,
    });

    expect(result.success).toBe(false);
  });

  it("accepts valid irrigation input", () => {
    const result = fieldIrrigationFormSchema.safeParse({
      irrigatedAt: "2026-06-27",
      cycleNumber: 2,
      remarks: "Cycle 2 complete",
    });

    expect(result.success).toBe(true);
  });
});
