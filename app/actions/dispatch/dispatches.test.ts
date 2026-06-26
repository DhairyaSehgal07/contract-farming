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
    size: {
      findMany: vi.fn(),
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

import { createDispatch, listDispatchableRequisitions } from "@/app/actions/dispatch/dispatches";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

const getSession = vi.mocked(getServerSession);
const findMany = vi.mocked(prisma.rolePermission.findMany);
const findManyRequisitions = vi.mocked(prisma.requisition.findMany);
const findManySizes = vi.mocked(prisma.size.findMany);
const transaction = vi.mocked(prisma.$transaction);

const validCreateInput = {
  requisitions: [
    {
      requisitionId: "req-1",
      sizeLines: [
        {
          sizeId: "size-1",
          generationId: "gen-1",
          quantity: "10",
        },
      ],
    },
  ],
  dispatchDate: "2026-06-20",
  dateOfReceiving: "",
  locationId: "",
  toLocation: "",
  truckNumber: "PB08 AB 1234",
  manualGatePassNumber: "",
  weightSlipNumber: "",
  driverMobileNumber: "",
  grossWeight: "",
  tareWeight: "",
  netWeight: "",
  averageWeightPerBag: "",
  remarks: "",
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
  findMany.mockImplementation(({ where }) => {
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

describe("dispatch action permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockReset();
  });

  it("denies createDispatch for users without dispatch write", async () => {
    mockSessionForRole(Role.USER);
    mockRoleGrants(Role.USER);

    const result = await createDispatch(validCreateInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "You do not have permission to perform this action.",
      );
    }
    expect(transaction).not.toHaveBeenCalled();
  });

  it("allows createDispatch for Managing Director", async () => {
    mockSessionForRole(Role.MANAGING_DIRECTOR);
    transaction.mockRejectedValueOnce(new Error("stop-after-auth"));

    const result = await createDispatch(validCreateInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("stop-after-auth");
    }
    expect(transaction).toHaveBeenCalled();
  });

  it("allows createDispatch for roles with seeded dispatch write access", async () => {
    mockSessionForRole(Role.LOGISTICS_EXECUTIVE);
    mockRoleGrants(Role.LOGISTICS_EXECUTIVE);
    transaction.mockRejectedValueOnce(new Error("stop-after-auth"));

    const result = await createDispatch(validCreateInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("stop-after-auth");
    }
    expect(transaction).toHaveBeenCalled();
  });

  it("denies listDispatchableRequisitions without dispatch read", async () => {
    mockSessionForRole(Role.USER);
    mockRoleGrants(Role.USER);

    const result = await listDispatchableRequisitions();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "You do not have permission to perform this action.",
      );
    }
  });

  it("allows listDispatchableRequisitions for roles with dispatch read", async () => {
    mockSessionForRole(Role.FIELD_OFFICER);
    mockRoleGrants(Role.FIELD_OFFICER);
    findManyRequisitions.mockResolvedValue([]);
    findManySizes.mockResolvedValue([]);

    const result = await listDispatchableRequisitions();

    expect(result.success).toBe(true);
    expect(findManyRequisitions).toHaveBeenCalled();
  });
});
