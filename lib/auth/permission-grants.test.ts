import { describe, expect, it } from "vitest";
import { normalizePermissionGrants } from "@/lib/auth/permission-catalog";

describe("normalizePermissionGrants", () => {
  it("adds read when only write is granted", () => {
    expect(
      normalizePermissionGrants([{ resource: "dispatch", action: "write" }]),
    ).toEqual([
      { resource: "dispatch", action: "write" },
      { resource: "dispatch", action: "read" },
    ]);
  });

  it("adds read when approve is granted", () => {
    expect(
      normalizePermissionGrants([{ resource: "requisition", action: "approve" }]),
    ).toEqual([
      { resource: "requisition", action: "approve" },
      { resource: "requisition", action: "read" },
    ]);
  });

  it("keeps existing read grants", () => {
    expect(
      normalizePermissionGrants([
        { resource: "master", action: "read" },
        { resource: "master", action: "write" },
      ]),
    ).toEqual([
      { resource: "master", action: "read" },
      { resource: "master", action: "write" },
    ]);
  });

  it("deduplicates grants", () => {
    const normalized = normalizePermissionGrants([
      { resource: "dispatch", action: "read" },
      { resource: "dispatch", action: "write" },
    ]);

    expect(normalized).toHaveLength(2);
    expect(normalized).toEqual(
      expect.arrayContaining([
        { resource: "dispatch", action: "read" },
        { resource: "dispatch", action: "write" },
      ]),
    );
  });
});
