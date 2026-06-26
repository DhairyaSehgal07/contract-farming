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
      create: vi.fn(),
    },
    farmer: {
      findUnique: vi.fn(),
    },
    variety: {
      findUnique: vi.fn(),
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
  createRequisition,
  listRequisitions,
} from "@/app/actions/requisition/requisitions";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

const getSession = vi.mocked(getServerSession);
const findManyPermissions = vi.mocked(prisma.rolePermission.findMany);
const findManyRequisitions = vi.mocked(prisma.requisition.findMany);
const createRequisitionRecord = vi.mocked(prisma.requisition.create);

const validRequisitionInput = {
  requisitionDate: "2026-06-01",
  requestedDeliveryDate: "2026-06-15",
  acres: "5",
  initialQuantity: "",
  remarks: "",
  farmerId: "farmer-1",
  varietyId: "variety-1",
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

describe("requisition action permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies listRequisitions without requisition read", async () => {
    mockSessionForRole(Role.USER);
    mockRoleGrants(Role.USER);

    const result = await listRequisitions();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "You do not have permission to perform this action.",
      );
    }
  });

  it("allows listRequisitions for field operations manager", async () => {
    mockSessionForRole(Role.FIELD_OPERATIONS_MANAGER);
    mockRoleGrants(Role.FIELD_OPERATIONS_MANAGER);
    findManyRequisitions.mockResolvedValue([]);

    const result = await listRequisitions();

    expect(result.success).toBe(true);
    expect(findManyRequisitions).toHaveBeenCalled();
  });

  it("denies createRequisition without requisition write", async () => {
    mockSessionForRole(Role.LOGISTICS_EXECUTIVE);
    mockRoleGrants(Role.LOGISTICS_EXECUTIVE);

    const result = await createRequisition(validRequisitionInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "You do not have permission to perform this action.",
      );
    }
    expect(createRequisitionRecord).not.toHaveBeenCalled();
  });

  it("allows createRequisition for managing director", async () => {
    mockSessionForRole(Role.MANAGING_DIRECTOR);
    vi.mocked(prisma.farmer.findUnique).mockResolvedValue({ id: "farmer-1" } as never);
    vi.mocked(prisma.variety.findUnique).mockResolvedValue({ id: "variety-1" } as never);
    createRequisitionRecord.mockRejectedValueOnce(new Error("stop-after-auth"));

    const result = await createRequisition(validRequisitionInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("stop-after-auth");
    }
    expect(createRequisitionRecord).toHaveBeenCalled();
  });
});
