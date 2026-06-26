import { Role } from "@/app/generated/prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/authorization", () => ({
  requireManagingDirectorAdminAction: vi.fn(async () => null),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    rolePermission: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    $transaction: vi.fn(async (callback: (tx: unknown) => Promise<void>) =>
      callback({
        rolePermission: {
          deleteMany: vi.fn(),
          createMany: vi.fn(),
        },
      }),
    ),
  },
}));

vi.mock("next/cache", () => ({
  updateTag: vi.fn(),
}));

import prisma from "@/lib/prisma";
import { updateRolePermissions } from "@/app/actions/permissions/roles";

describe("updateRolePermissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid permission grants", async () => {
    const result = await updateRolePermissions({
      role: Role.USER,
      grants: [{ resource: "invalid", action: "read" }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Invalid permission");
    }
  });

  it("rejects invalid role values at schema level", async () => {
    const result = await updateRolePermissions({
      role: "MANAGING_DIRECTOR" as Role.USER,
      grants: [{ resource: "dashboard", action: "read" }],
    });

    expect(result.success).toBe(false);
  });

  it("persists valid grants for editable roles", async () => {
    const result = await updateRolePermissions({
      role: Role.USER,
      grants: [{ resource: "dashboard", action: "read" }],
    });

    expect(result.success).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it("adds read when saving write-only dispatch grants", async () => {
    const createMany = vi.fn();
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) =>
      callback({
        rolePermission: {
          deleteMany: vi.fn(),
          createMany,
        },
      }),
    );

    const result = await updateRolePermissions({
      role: Role.USER,
      grants: [{ resource: "dispatch", action: "write" }],
    });

    expect(result.success).toBe(true);
    expect(createMany).toHaveBeenCalledWith({
      data: [
        { role: Role.USER, resource: "dispatch", action: "write" },
        { role: Role.USER, resource: "dispatch", action: "read" },
      ],
    });
  });

  it("accepts requisition approve grants", async () => {
    const result = await updateRolePermissions({
      role: Role.PROGRAMME_MANAGER,
      grants: [{ resource: "requisition", action: "approve" }],
    });

    expect(result.success).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it("rejects approve grants on resources without approve action", async () => {
    const result = await updateRolePermissions({
      role: Role.USER,
      grants: [{ resource: "dashboard", action: "approve" }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Invalid permission");
    }
  });
});
