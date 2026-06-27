import { describe, expect, it, vi, beforeEach } from "vitest";
import { Role } from "@/app/generated/prisma/client";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth/default-role-permissions";

vi.mock("@/lib/prisma", () => ({
  default: {
    rolePermission: {
      findMany: vi.fn(),
    },
    farmerFamily: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
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

import {
  createFarmerFamily,
  deleteFarmerFamily,
  listFarmerFamilyRecords,
} from "@/app/actions/master/farmer-families";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

const getSession = vi.mocked(getServerSession);
const findManyPermissions = vi.mocked(prisma.rolePermission.findMany);
const findManyFamilies = vi.mocked(prisma.farmerFamily.findMany);
const createFamilyRecord = vi.mocked(prisma.farmerFamily.create);
const findFamily = vi.mocked(prisma.farmerFamily.findUnique);
const deleteFamilyRecord = vi.mocked(prisma.farmerFamily.delete);

const validFamilyInput = {
  accountNumber: "99",
  name: "Test Family",
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

describe("farmer family actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows listFarmerFamilyRecords for programme manager", async () => {
    mockSessionForRole(Role.PROGRAMME_MANAGER);
    mockRoleGrants(Role.PROGRAMME_MANAGER);
    findManyFamilies.mockResolvedValue([]);

    const result = await listFarmerFamilyRecords();

    expect(result.success).toBe(true);
    expect(findManyFamilies).toHaveBeenCalled();
  });

  it("creates a family for managing director", async () => {
    mockSessionForRole(Role.MANAGING_DIRECTOR);
    vi.mocked(prisma.locality.findFirst).mockResolvedValue({ id: "locality-1" } as never);
    createFamilyRecord.mockResolvedValue({
      id: "family-1",
      ...validFamilyInput,
    } as never);

    const result = await createFarmerFamily(validFamilyInput);

    expect(result.success).toBe(true);
    expect(createFamilyRecord).toHaveBeenCalled();
  });

  it("blocks deleting a family with members", async () => {
    mockSessionForRole(Role.MANAGING_DIRECTOR);
    findFamily.mockResolvedValue({
      id: "family-1",
      _count: { members: 2 },
    } as never);

    const result = await deleteFarmerFamily("family-1");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("linked members");
    }
    expect(deleteFamilyRecord).not.toHaveBeenCalled();
  });
});
