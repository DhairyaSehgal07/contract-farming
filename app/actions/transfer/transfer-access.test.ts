import { beforeEach, describe, expect, it, vi } from "vitest";
import { Role } from "@/app/generated/prisma/client";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth/default-role-permissions";

vi.mock("@/lib/prisma", () => ({
  default: {
    rolePermission: {
      findMany: vi.fn(),
    },
    stockTransfer: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    farmer: {
      findUnique: vi.fn(),
    },
    farmerStockBalance: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
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

import {
  createStockTransfer,
  listStockTransfers,
} from "@/app/actions/transfer/stock-transfers";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

const getSession = vi.mocked(getServerSession);
const findManyPermissions = vi.mocked(prisma.rolePermission.findMany);
const findManyTransfers = vi.mocked(prisma.stockTransfer.findMany);
const runTransaction = vi.mocked(prisma.$transaction);

const validTransferInput = {
  transferDate: "2026-06-27",
  fromFarmerId: "farmer-1",
  toFarmerId: "farmer-2",
  remarks: "",
  lines: [
    {
      varietyId: "variety-1",
      sizeId: "size-1",
      generationId: "generation-1",
      quantity: "5",
    },
  ],
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

describe("transfer action permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies listStockTransfers without transfer read", async () => {
    mockSessionForRole(Role.USER);
    mockRoleGrants(Role.USER);

    const result = await listStockTransfers();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "You do not have permission to perform this action.",
      );
    }
  });

  it("allows listStockTransfers for logistics executive", async () => {
    mockSessionForRole(Role.LOGISTICS_EXECUTIVE);
    mockRoleGrants(Role.LOGISTICS_EXECUTIVE);
    findManyTransfers.mockResolvedValue([]);

    const result = await listStockTransfers();

    expect(result.success).toBe(true);
    expect(findManyTransfers).toHaveBeenCalled();
  });

  it("denies createStockTransfer without transfer write for user role", async () => {
    mockSessionForRole(Role.USER);
    mockRoleGrants(Role.USER);

    const result = await createStockTransfer(validTransferInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "You do not have permission to perform this action.",
      );
    }
  });

  it("allows createStockTransfer for managing director", async () => {
    mockSessionForRole(Role.MANAGING_DIRECTOR);
    runTransaction.mockRejectedValueOnce(new Error("stop-after-auth"));

    const result = await createStockTransfer(validTransferInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("stop-after-auth");
    }
    expect(runTransaction).toHaveBeenCalled();
  });
});
