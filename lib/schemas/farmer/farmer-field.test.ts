import { describe, expect, it } from "vitest";
import {
  createFarmerFieldSchema,
  farmerFieldFormSchema,
} from "@/lib/schemas/farmer/farmer-field";

describe("farmerFieldFormSchema", () => {
  it("requires name, geo location, and acres", () => {
    const result = farmerFieldFormSchema.safeParse({
      name: "",
      geoLocation: "",
      acres: "",
    });

    expect(result.success).toBe(false);
  });

  it("accepts valid field input", () => {
    const result = farmerFieldFormSchema.safeParse({
      name: "North plot",
      geoLocation: "28.6139, 77.2090",
      acres: "5.25",
    });

    expect(result.success).toBe(true);
  });

  it("rejects non-positive acres", () => {
    const result = farmerFieldFormSchema.safeParse({
      name: "North plot",
      geoLocation: "28.6139, 77.2090",
      acres: "0",
    });

    expect(result.success).toBe(false);
  });
});

describe("createFarmerFieldSchema", () => {
  it("requires farmerId", () => {
    const result = createFarmerFieldSchema.safeParse({
      name: "North plot",
      geoLocation: "28.6139, 77.2090",
      acres: "2",
    });

    expect(result.success).toBe(false);
  });
});
