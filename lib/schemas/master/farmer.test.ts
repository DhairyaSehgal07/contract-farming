import { describe, expect, it } from "vitest";
import { inferFarmerKind } from "@/lib/master/farmer-family";
import {
  farmerFormSchema,
  validateFarmerKindWithFamilyAccount,
} from "@/lib/schemas/master/farmer";

describe("farmer family helpers", () => {
  it("infers farmer kind from family linkage", () => {
    expect(
      inferFarmerKind({
        familyId: null,
        accountNumber: "99",
        familyAccountNumber: null,
      }),
    ).toBe("individual");

    expect(
      inferFarmerKind({
        familyId: "family-1",
        accountNumber: "20",
        familyAccountNumber: "20",
      }),
    ).toBe("family_head");

    expect(
      inferFarmerKind({
        familyId: "family-1",
        accountNumber: "82",
        familyAccountNumber: "20",
      }),
    ).toBe("family_member");
  });
});

describe("farmerFormSchema", () => {
  const base = {
    name: "Test Farmer",
    mobileNumber: "9876543210",
    aadharNumber: "123456789012",
    panCardNumber: "",
    bankAccountName: "",
    bankName: "",
    bankAccountNumber: "",
    bankIfscCode: "",
    bankBranchName: "",
    contractUrl: "",
    stationId: "station-1",
    localityId: "locality-1",
    familyId: "",
  };

  it("accepts individual farmers without a family", () => {
    const result = farmerFormSchema.safeParse({
      ...base,
      farmerKind: "individual",
      accountNumber: "99",
    });

    expect(result.success).toBe(true);
  });

  it("rejects decimal account numbers", () => {
    const result = farmerFormSchema.safeParse({
      ...base,
      farmerKind: "individual",
      accountNumber: "20.1",
    });

    expect(result.success).toBe(false);
  });

  it("requires whole-number account numbers for family heads", () => {
    const result = farmerFormSchema.safeParse({
      ...base,
      farmerKind: "family_head",
      accountNumber: "20.1",
    });

    expect(result.success).toBe(false);
  });

  it("requires a family for members", () => {
    const result = farmerFormSchema.safeParse({
      ...base,
      farmerKind: "family_member",
      accountNumber: "82",
      familyId: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects member account numbers that match the family account", () => {
    const result = validateFarmerKindWithFamilyAccount(
      {
        ...base,
        farmerKind: "family_member",
        accountNumber: "20",
        familyId: "family-1",
      },
      "20",
    );

    expect(result.success).toBe(false);
  });
});
