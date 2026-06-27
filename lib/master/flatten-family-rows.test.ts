import { describe, expect, it } from "vitest";
import { flattenFamilyRows } from "@/lib/master/flatten-family-rows";

describe("flattenFamilyRows", () => {
  const family = {
    id: "family-1",
    accountNumber: "20",
    name: "SUKHDEV SINGH Family",
    stationId: "station-1",
    localityId: "locality-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    station: { name: "PURANPUR-I" },
    locality: { name: "ZONE 1" },
    members: [
      { id: "farmer-1", name: "SUKHDEV SINGH S/O ARJUN SINGH", accountNumber: "20" },
      { id: "farmer-2", name: "SOHAN SINGH S/O SUKHDEV SINGH", accountNumber: "82" },
    ],
    _count: { members: 2 },
  };

  it("creates one row per member", () => {
    const rows = flattenFamilyRows([family]);

    expect(rows).toHaveLength(2);
    expect(rows[0]?.memberName).toContain("SUKHDEV");
    expect(rows[1]?.memberAccountNumber).toBe("82");
    expect(rows[0]?.familyId).toBe("family-1");
    expect(rows[1]?.familyId).toBe("family-1");
  });

  it("creates a placeholder row when a family has no members", () => {
    const rows = flattenFamilyRows([
      {
        ...family,
        members: [],
        _count: { members: 0 },
      },
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.memberName).toBeNull();
    expect(rows[0]?.memberAccountNumber).toBeNull();
  });
});
