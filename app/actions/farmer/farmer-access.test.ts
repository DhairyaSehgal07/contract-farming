import { beforeEach, describe, expect, it, vi } from "vitest";
import { Role } from "@/app/generated/prisma/client";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth/default-role-permissions";

vi.mock("@/lib/prisma", () => ({
  default: {
    rolePermission: {
      findMany: vi.fn(),
    },
    requisition: {
      findMany: vi.fn(),
    },
    dispatch: {
      findMany: vi.fn(),
    },
    dispatchLot: {
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
  listFarmerDispatches,
  listFarmerReceivedLots,
  listFarmerRequisitions,
} from "@/app/actions/farmer/farmer-profile";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

const getSession = vi.mocked(getServerSession);
const findManyPermissions = vi.mocked(prisma.rolePermission.findMany);
const findManyRequisitions = vi.mocked(prisma.requisition.findMany);
const findManyDispatches = vi.mocked(prisma.dispatch.findMany);
const findManyReceivedLots = vi.mocked(prisma.dispatchLot.findMany);

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

describe("farmer profile action permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies listFarmerRequisitions without farmer read access", async () => {
    mockSessionForRole(Role.USER);
    mockRoleGrants(Role.USER);

    const result = await listFarmerRequisitions("farmer-1");

    expect(result.success).toBe(false);
    expect(findManyRequisitions).not.toHaveBeenCalled();
  });

  it("allows listFarmerRequisitions for logistics executive", async () => {
    mockSessionForRole(Role.LOGISTICS_EXECUTIVE);
    mockRoleGrants(Role.LOGISTICS_EXECUTIVE);
    findManyRequisitions.mockResolvedValue([]);

    const result = await listFarmerRequisitions("farmer-1");

    expect(result.success).toBe(true);
    expect(findManyRequisitions).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { farmerId: "farmer-1" },
      }),
    );
  });

  it("allows listFarmerDispatches for accounts settlements manager", async () => {
    mockSessionForRole(Role.ACCOUNTS_SETTLEMENTS_MANAGER);
    mockRoleGrants(Role.ACCOUNTS_SETTLEMENTS_MANAGER);
    findManyDispatches.mockResolvedValue([]);

    const result = await listFarmerDispatches("farmer-1");

    expect(result.success).toBe(true);
    expect(findManyDispatches).toHaveBeenCalled();
  });

  it("filters received lots by farmer and received status", async () => {
    mockSessionForRole(Role.FIELD_OFFICER);
    mockRoleGrants(Role.FIELD_OFFICER);
    findManyReceivedLots.mockResolvedValue([]);

    const result = await listFarmerReceivedLots("farmer-1");

    expect(result.success).toBe(true);
    expect(findManyReceivedLots).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "RECEIVED",
          dispatchRequisition: {
            requisition: { farmerId: "farmer-1" },
          },
        }),
      }),
    );
  });
});
