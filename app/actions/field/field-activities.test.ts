import { beforeEach, describe, expect, it, vi } from "vitest";
import { Role } from "@/app/generated/prisma/client";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth/default-role-permissions";

vi.mock("@/lib/prisma", () => ({
  default: {
    rolePermission: {
      findMany: vi.fn(),
    },
    farmerField: {
      findUnique: vi.fn(),
    },
    fieldPlantation: {
      create: vi.fn(),
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
  createFieldPlantation,
  getFieldDetail,
} from "@/app/actions/field/field-activities";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

const getSession = vi.mocked(getServerSession);
const findManyPermissions = vi.mocked(prisma.rolePermission.findMany);
const findField = vi.mocked(prisma.farmerField.findUnique);
const createPlantation = vi.mocked(prisma.fieldPlantation.create);

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

describe("field activity actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies getFieldDetail without farmer read access", async () => {
    mockSessionForRole(Role.USER);
    mockRoleGrants(Role.USER);

    const result = await getFieldDetail("field-1");

    expect(result.success).toBe(false);
    expect(findField).not.toHaveBeenCalled();
  });

  it("loads field detail for logistics executive", async () => {
    mockSessionForRole(Role.LOGISTICS_EXECUTIVE);
    mockRoleGrants(Role.LOGISTICS_EXECUTIVE);
    findField.mockResolvedValue({
      id: "field-1",
      farmerId: "farmer-1",
      name: "North plot",
      geoLocation: "28.6139, 77.2090",
      acres: { toString: () => "3" },
      createdAt: new Date("2026-06-01"),
      updatedAt: new Date("2026-06-01"),
      farmer: {
        id: "farmer-1",
        name: "Test Farmer",
        accountNumber: "1001",
      },
      plantations: [],
      irrigations: [],
      dehaulming: [],
      rouging: [],
      stripTests: [],
      harvests: [],
    } as never);

    const result = await getFieldDetail("field-1");

    expect(result.success).toBe(true);
    expect(findField).toHaveBeenCalled();
  });

  it("denies createFieldPlantation without master write", async () => {
    mockSessionForRole(Role.LOGISTICS_EXECUTIVE);
    mockRoleGrants(Role.LOGISTICS_EXECUTIVE);

    const result = await createFieldPlantation({
      fieldId: "field-1",
      varietyId: "variety-1",
      sizeId: "size-1",
      plantedAt: "2026-06-27",
      bagCount: "90",
      acresPlanted: "3",
    });

    expect(result.success).toBe(false);
    expect(createPlantation).not.toHaveBeenCalled();
  });
});
