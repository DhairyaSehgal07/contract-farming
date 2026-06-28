import { describe, expect, it } from "vitest";
import { aggregateFamilyStock } from "@/lib/transfer/aggregate-family-stock";

describe("aggregateFamilyStock", () => {
  it("sums quantities for matching variety, size, and generation", () => {
    const result = aggregateFamilyStock([
      {
        varietyId: "v1",
        variety: { id: "v1", name: "Atlantic" },
        sizeId: "s1",
        size: { id: "s1", name: "Large" },
        generationId: "g1",
        generation: { id: "g1", name: "G1" },
        quantity: "10",
      },
      {
        varietyId: "v1",
        variety: { id: "v1", name: "Atlantic" },
        sizeId: "s1",
        size: { id: "s1", name: "Large" },
        generationId: "g1",
        generation: { id: "g1", name: "G1" },
        quantity: "5.5",
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]?.quantity).toBe("15.5");
  });

  it("ignores zero or negative quantities", () => {
    const result = aggregateFamilyStock([
      {
        varietyId: "v1",
        variety: { id: "v1", name: "Atlantic" },
        sizeId: "s1",
        size: { id: "s1", name: "Large" },
        generationId: "g1",
        generation: { id: "g1", name: "G1" },
        quantity: "0",
      },
    ]);

    expect(result).toEqual([]);
  });
});
