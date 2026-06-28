import { beforeEach, describe, expect, it, vi } from "vitest";
import { DispatchStatus, Role } from "@/app/generated/prisma/client";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth/default-role-permissions";

vi.mock("@/lib/prisma", () => ({
  default: {
    rolePermission: {
      findMany: vi.fn(),
    },
    farmerFamily: {
      findUnique: vi.fn(),
    },
    dispatch: {
      findMany: vi.fn(),
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
  getFarmerFamilyProfile,
  listFamilyDispatches,
} from "@/app/actions/farmer/farmer-family-profile";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

const getSession = vi.mocked(getServerSession);
const findManyPermissions = vi.mocked(prisma.rolePermission.findMany);
const findUniqueFamily = vi.mocked(prisma.farmerFamily.findUnique);
const findManyDispatches = vi.mocked(prisma.dispatch.findMany);

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

describe("farmer family profile actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads a family profile for authorized users", async () => {
    mockSessionForRole(Role.MANAGING_DIRECTOR);
    findUniqueFamily.mockResolvedValue({
      id: "family-1",
      accountNumber: "20",
      name: "Sharma Family",
      stationId: "station-1",
      localityId: "locality-1",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
      station: { name: "Main" },
      locality: { name: "North" },
      members: [
        { id: "farmer-1", name: "Ramesh", accountNumber: "1001" },
      ],
      _count: { members: 1 },
    } as never);

    const result = await getFarmerFamilyProfile("family-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Sharma Family");
      expect(result.data.members).toHaveLength(1);
    }
  });

  it("returns only assignments for family members on a multi-farmer dispatch", async () => {
    mockSessionForRole(Role.MANAGING_DIRECTOR);
    findUniqueFamily.mockResolvedValue({ id: "family-1" } as never);
    findManyDispatches.mockResolvedValue([
      {
        id: "dispatch-1",
        status: DispatchStatus.OPEN,
        dispatchDate: new Date("2026-06-01"),
        location: { name: "Cold store" },
        requisitions: [
          {
            requisitionId: "req-1",
            requisition: {
              farmerId: "farmer-1",
              farmer: {
                id: "farmer-1",
                name: "Ramesh",
                accountNumber: "1001",
                familyId: "family-1",
              },
              variety: { name: "Atlantic" },
            },
            lot: { status: "PENDING", receivedAt: null },
          },
          {
            requisitionId: "req-2",
            requisition: {
              farmerId: "farmer-2",
              farmer: {
                id: "farmer-2",
                name: "Other",
                accountNumber: "2002",
                familyId: "family-2",
              },
              variety: { name: "Kufri" },
            },
            lot: { status: "PENDING", receivedAt: null },
          },
        ],
      },
    ] as never);

    const result = await listFamilyDispatches("family-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.farmer.name).toBe("Ramesh");
      expect(result.data[0]?.variety.name).toBe("Atlantic");
    }
  });
});
