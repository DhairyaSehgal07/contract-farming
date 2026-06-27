import { beforeEach, describe, expect, it, vi } from "vitest";
import { DispatchLotStatus, DispatchStatus } from "@/app/generated/prisma/client";
import { Role } from "@/app/generated/prisma/client";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth/default-role-permissions";

vi.mock("@/lib/prisma", () => ({
  default: {
    rolePermission: {
      findMany: vi.fn(),
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

import { listFarmerDispatches } from "@/app/actions/farmer/farmer-profile";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

const getSession = vi.mocked(getServerSession);
const findManyPermissions = vi.mocked(prisma.rolePermission.findMany);
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

describe("farmer profile actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only the matching farmer assignment on a multi-farmer dispatch", async () => {
    mockSessionForRole(Role.MANAGING_DIRECTOR);
    findManyDispatches.mockResolvedValue([
      {
        id: "dispatch-1",
        status: DispatchStatus.OPEN,
        dispatchDate: new Date("2026-06-01"),
        location: { name: "Depot A" },
        requisitions: [
          {
            requisitionId: "req-1",
            requisition: {
              farmerId: "farmer-1",
              variety: { name: "Wheat" },
            },
            lot: {
              status: DispatchLotStatus.RECEIVED,
              receivedAt: new Date("2026-06-02T10:00:00.000Z"),
            },
          },
          {
            requisitionId: "req-2",
            requisition: {
              farmerId: "farmer-2",
              variety: { name: "Rice" },
            },
            lot: {
              status: DispatchLotStatus.PENDING,
              receivedAt: null,
            },
          },
        ],
      },
    ] as never);

    const result = await listFarmerDispatches("farmer-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toMatchObject({
        dispatchId: "dispatch-1",
        variety: { name: "Wheat" },
        lotStatus: "RECEIVED",
        requisitionId: "req-1",
      });
    }
  });
});
