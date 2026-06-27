import { describe, expect, it } from "vitest";
import type { FieldDetail } from "@/app/actions/field/field-activities";
import { getFieldActivityStages } from "@/lib/field/step-state";

const emptyDetail: FieldDetail = {
  id: "field-1",
  farmerId: "farmer-1",
  name: "North plot",
  geoLocation: "28.6139, 77.2090",
  acres: "3",
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
  farmer: {
    id: "farmer-1",
    name: "Test Farmer",
    accountNumber: "1001",
  },
  plantations: [],
  irrigations: [],
  dehaulming: [],
  rouging: [],
  stripTests: [],
  harvests: [],
};

describe("getFieldActivityStages", () => {
  it("marks stages complete when records exist", () => {
    const detail: FieldDetail = {
      ...emptyDetail,
      plantations: [
        {
          id: "p-1",
          fieldId: "field-1",
          varietyId: "v-1",
          varietyName: "B101",
          sizeId: "s-1",
          sizeName: "Medium",
          bagCount: "90",
          acresPlanted: "3",
          plantedAt: "2026-06-01",
          imageUrl: null,
          remarks: null,
          createdAt: "2026-06-01T00:00:00.000Z",
          updatedAt: "2026-06-01T00:00:00.000Z",
        },
      ],
    };

    const stages = getFieldActivityStages(detail, "irrigation");

    expect(stages[0]?.status).toBe("complete");
    expect(stages[1]?.status).toBe("active");
    expect(stages[2]?.status).toBe("upcoming");
  });

  it("describes plantation count", () => {
    const detail: FieldDetail = {
      ...emptyDetail,
      plantations: [
        {
          id: "p-1",
          fieldId: "field-1",
          varietyId: "v-1",
          varietyName: "B101",
          sizeId: "s-1",
          sizeName: "Medium",
          bagCount: "90",
          acresPlanted: "3",
          plantedAt: "2026-06-01",
          imageUrl: null,
          remarks: null,
          createdAt: "2026-06-01T00:00:00.000Z",
          updatedAt: "2026-06-01T00:00:00.000Z",
        },
        {
          id: "p-2",
          fieldId: "field-1",
          varietyId: "v-2",
          varietyName: "B102",
          sizeId: "s-1",
          sizeName: "Medium",
          bagCount: "45",
          acresPlanted: "1.5",
          plantedAt: "2026-06-15",
          imageUrl: null,
          remarks: null,
          createdAt: "2026-06-15T00:00:00.000Z",
          updatedAt: "2026-06-15T00:00:00.000Z",
        },
      ],
    };

    const stages = getFieldActivityStages(detail, "plantation");

    expect(stages[0]?.description).toContain("2 plantations recorded");
  });
});
