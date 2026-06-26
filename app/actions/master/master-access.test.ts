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
    locality: {
      findFirst: vi.fn(),
    },
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

const validFarmerInput = {
  name: "Test Farmer",
  accountNumber: "ACC-100",
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
  });

  it("denies listFarmers without master read", async () => {
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
});
