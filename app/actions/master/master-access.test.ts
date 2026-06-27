import { beforeEach, describe, expect, it, vi } from "vitest";
import { Role } from "@/app/generated/prisma/client";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth/default-role-permissions";

vi.mock("@/lib/prisma", () => ({
  default: {
    rolePermission: {
      findMany: vi.fn(),
    },
    farmer: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    farmerFamily: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    locality: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: () => Promise<string[]>) => () => fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  getServerSession: vi.fn(),
}));

import { createFarmer, listFarmers } from "@/app/actions/master/farmers";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

const getSession = vi.mocked(getServerSession);
const findManyPermissions = vi.mocked(prisma.rolePermission.findMany);
const findManyFarmers = vi.mocked(prisma.farmer.findMany);
const createFarmerRecord = vi.mocked(prisma.farmer.create);
const createFamilyRecord = vi.mocked(prisma.farmerFamily.create);
const runTransaction = vi.mocked(prisma.$transaction);

const validFarmerInput = {
  name: "Test Farmer",
  accountNumber: "100",
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
  farmerKind: "individual" as const,
  familyId: "",
};

function mockSessionForRole(role: Role) {
  getSession.mockResolvedValue({
    user: {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      role,
    },
    session: {
      id: "session-1",
      token: "token",
      userId: "user-1",
      expiresAt: new Date("2030-01-01"),
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    },
  } as never);
}

function mockRoleGrants(role: Role) {
  const grants = DEFAULT_ROLE_PERMISSIONS[role];
  findManyPermissions.mockImplementation(({ where }) => {
    if (where.role === role) {
      return Promise.resolve(
        grants.map((grant, index) => ({
          id: `${role}-${index}`,
          role,
          resource: grant.resource,
          action: grant.action,
        })),
      );
    }
    return Promise.resolve([]);
  });
}

describe("master action permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runTransaction.mockImplementation(async (callback) =>
      callback({
        farmerFamily: { create: createFamilyRecord },
        farmer: { create: createFarmerRecord },
      } as never),
    );
  });

  it("denies listFarmers without farmer read access", async () => {
    mockSessionForRole(Role.USER);
    mockRoleGrants(Role.USER);

    const result = await listFarmers();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "You do not have permission to perform this action.",
      );
    }
  });

  it("allows listFarmers for programme manager", async () => {
    mockSessionForRole(Role.PROGRAMME_MANAGER);
    mockRoleGrants(Role.PROGRAMME_MANAGER);
    findManyFarmers.mockResolvedValue([]);

    const result = await listFarmers();

    expect(result.success).toBe(true);
    expect(findManyFarmers).toHaveBeenCalled();
  });

  it("allows listFarmers for logistics executive via dispatch read", async () => {
    mockSessionForRole(Role.LOGISTICS_EXECUTIVE);
    mockRoleGrants(Role.LOGISTICS_EXECUTIVE);
    findManyFarmers.mockResolvedValue([]);

    const result = await listFarmers();

    expect(result.success).toBe(true);
    expect(findManyFarmers).toHaveBeenCalled();
  });

  it("denies createFarmer without master write", async () => {
    mockSessionForRole(Role.LOGISTICS_EXECUTIVE);
    mockRoleGrants(Role.LOGISTICS_EXECUTIVE);

    const result = await createFarmer(validFarmerInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "You do not have permission to perform this action.",
      );
    }
    expect(createFarmerRecord).not.toHaveBeenCalled();
  });

  it("allows createFarmer for managing director", async () => {
    mockSessionForRole(Role.MANAGING_DIRECTOR);
    vi.mocked(prisma.locality.findFirst).mockResolvedValue({ id: "locality-1" } as never);
    createFarmerRecord.mockRejectedValueOnce(new Error("stop-after-auth"));

    const result = await createFarmer(validFarmerInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("stop-after-auth");
    }
    expect(createFarmerRecord).toHaveBeenCalled();
  });

  it("creates a family and farmer for family_head", async () => {
    mockSessionForRole(Role.MANAGING_DIRECTOR);
    vi.mocked(prisma.locality.findFirst).mockResolvedValue({ id: "locality-1" } as never);
    createFamilyRecord.mockResolvedValue({
      id: "family-1",
      accountNumber: "20",
    } as never);
    createFarmerRecord.mockResolvedValue({
      id: "farmer-1",
      familyId: "family-1",
    } as never);

    const result = await createFarmer({
      ...validFarmerInput,
      farmerKind: "family_head",
      accountNumber: "20",
    });

    expect(result.success).toBe(true);
    expect(createFamilyRecord).toHaveBeenCalledWith({
      data: expect.objectContaining({
        accountNumber: "20",
        name: "Test Farmer Family",
      }),
    });
    expect(createFarmerRecord).toHaveBeenCalledWith({
      data: expect.objectContaining({
        familyId: "family-1",
        accountNumber: "20",
      }),
      include: expect.any(Object),
    });
  });

  it("creates a family member linked to an existing family", async () => {
    mockSessionForRole(Role.MANAGING_DIRECTOR);
    vi.mocked(prisma.locality.findFirst).mockResolvedValue({ id: "locality-1" } as never);
    vi.mocked(prisma.farmerFamily.findUnique).mockResolvedValue({
      id: "family-1",
      accountNumber: "20",
      name: "SUKHDEV SINGH Family",
      members: [{ id: "farmer-head", accountNumber: "20" }],
    } as never);
    createFarmerRecord.mockResolvedValue({
      id: "farmer-2",
      familyId: "family-1",
    } as never);

    const result = await createFarmer({
      ...validFarmerInput,
      farmerKind: "family_member",
      familyId: "family-1",
      accountNumber: "82",
    });

    expect(result.success).toBe(true);
    expect(createFamilyRecord).not.toHaveBeenCalled();
    expect(createFarmerRecord).toHaveBeenCalledWith({
      data: expect.objectContaining({
        familyId: "family-1",
        accountNumber: "82",
      }),
      include: expect.any(Object),
    });
  });
});
