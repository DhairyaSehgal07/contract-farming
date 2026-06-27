import { beforeEach, describe, expect, it, vi } from "vitest";
import { Role } from "@/app/generated/prisma/client";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth/default-role-permissions";

vi.mock("@/lib/prisma", () => ({
  default: {
    rolePermission: {
      findMany: vi.fn(),
    },
    farmer: {
      findUnique: vi.fn(),
    },
    farmerField: {
      findMany: vi.fn(),
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
  createFarmerField,
  listFarmerFields,
} from "@/app/actions/farmer/farmer-fields";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

const getSession = vi.mocked(getServerSession);
const findManyPermissions = vi.mocked(prisma.rolePermission.findMany);
const findManyFields = vi.mocked(prisma.farmerField.findMany);
const findFarmer = vi.mocked(prisma.farmer.findUnique);
const createField = vi.mocked(prisma.farmerField.create);

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

describe("farmer field actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies listFarmerFields without farmer read access", async () => {
    mockSessionForRole(Role.USER);
    mockRoleGrants(Role.USER);

    const result = await listFarmerFields("farmer-1");

    expect(result.success).toBe(false);
    expect(findManyFields).not.toHaveBeenCalled();
  });

  it("lists fields for a farmer", async () => {
    mockSessionForRole(Role.LOGISTICS_EXECUTIVE);
    mockRoleGrants(Role.LOGISTICS_EXECUTIVE);
    findManyFields.mockResolvedValue([]);

    const result = await listFarmerFields("farmer-1");

    expect(result.success).toBe(true);
    expect(findManyFields).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { farmerId: "farmer-1" },
      }),
    );
  });

  it("denies createFarmerField without master write", async () => {
    mockSessionForRole(Role.LOGISTICS_EXECUTIVE);
    mockRoleGrants(Role.LOGISTICS_EXECUTIVE);

    const result = await createFarmerField({
      farmerId: "farmer-1",
      name: "North plot",
      geoLocation: "28.6139, 77.2090",
      acres: "2",
    });

    expect(result.success).toBe(false);
    expect(createField).not.toHaveBeenCalled();
  });

  it("creates a field for managing director", async () => {
    mockSessionForRole(Role.MANAGING_DIRECTOR);
    findFarmer.mockResolvedValue({ id: "farmer-1" } as never);
    createField.mockResolvedValue({
      id: "field-1",
      farmerId: "farmer-1",
      name: "North plot",
      geoLocation: "28.6139, 77.2090",
      acres: { toString: () => "2" },
      createdAt: new Date("2026-06-01"),
      updatedAt: new Date("2026-06-01"),
    } as never);

    const result = await createFarmerField({
      farmerId: "farmer-1",
      name: "North plot",
      geoLocation: "28.6139, 77.2090",
      acres: "2",
    });

    expect(result.success).toBe(true);
    expect(createField).toHaveBeenCalled();
  });
});
