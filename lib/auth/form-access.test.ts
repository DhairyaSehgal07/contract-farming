import { Role } from "@/app/generated/prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth/default-role-permissions";
import { MANAGING_DIRECTOR_ROLE } from "@/lib/auth/roles";

vi.mock("@/lib/prisma", () => ({
  default: {
    rolePermission: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: () => Promise<string[]>) => () => fn(),
}));

import prisma from "@/lib/prisma";
import { roleHasPermission } from "@/lib/auth/authorization";

const findMany = vi.mocked(prisma.rolePermission.findMany);

type FormOperation = {
  label: string;
  resource: "master" | "permissions" | "requisition" | "dispatch";
  action: "read" | "write" | "approve";
};

const FORM_OPERATIONS: FormOperation[] = [
  { label: "master list", resource: "master", action: "read" },
  { label: "master create/edit", resource: "master", action: "write" },
  { label: "permissions view", resource: "permissions", action: "read" },
  { label: "permissions edit", resource: "permissions", action: "write" },
  { label: "requisition list", resource: "requisition", action: "read" },
  { label: "requisition create/edit", resource: "requisition", action: "write" },
  { label: "requisition approve/reject", resource: "requisition", action: "approve" },
  { label: "dispatch list", resource: "dispatch", action: "read" },
  { label: "dispatch create/edit", resource: "dispatch", action: "write" },
];

function mockRoleGrants(role: Role, grants: { resource: string; action: string }[]) {
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

function roleHasGrant(
  role: Role,
  resource: FormOperation["resource"],
  action: FormOperation["action"],
) {
  const grants = DEFAULT_ROLE_PERMISSIONS[role];
  return grants.some(
    (grant) => grant.resource === resource && grant.action === action,
  );
}

describe("form access by seeded role permissions", () => {
  beforeEach(() => {
    findMany.mockReset();
  });

  it("allows Managing Director to perform every form operation", async () => {
    for (const operation of FORM_OPERATIONS) {
      await expect(
        roleHasPermission(
          MANAGING_DIRECTOR_ROLE,
          operation.resource,
          operation.action,
        ),
      ).resolves.toBe(true);
    }

    expect(findMany).not.toHaveBeenCalled();
  });

  it.each(
    Object.values(Role).filter((role) => role !== Role.MANAGING_DIRECTOR),
  )("matches seeded grants for %s", async (role) => {
    mockRoleGrants(role, DEFAULT_ROLE_PERMISSIONS[role]);

    for (const operation of FORM_OPERATIONS) {
      const expected = roleHasGrant(role, operation.resource, operation.action);
      await expect(
        roleHasPermission(role, operation.resource, operation.action),
      ).resolves.toBe(expected);
    }
  });

  it("allows dispatch create when only write is stored after normalization", async () => {
    mockRoleGrants(Role.USER, [
      { resource: "dashboard", action: "read" },
      { resource: "dispatch", action: "read" },
      { resource: "dispatch", action: "write" },
    ]);

    await expect(
      roleHasPermission(Role.USER, "dispatch", "read"),
    ).resolves.toBe(true);
    await expect(
      roleHasPermission(Role.USER, "dispatch", "write"),
    ).resolves.toBe(true);
  });

  it("denies dispatch create without write grant", async () => {
    mockRoleGrants(Role.USER, [
      { resource: "dashboard", action: "read" },
      { resource: "dispatch", action: "read" },
    ]);

    await expect(
      roleHasPermission(Role.USER, "dispatch", "write"),
    ).resolves.toBe(false);
  });

  it("denies dispatch section access without read grant", async () => {
    mockRoleGrants(Role.USER, [{ resource: "dashboard", action: "read" }]);

    await expect(
      roleHasPermission(Role.USER, "dispatch", "read"),
    ).resolves.toBe(false);
  });
});

describe("dispatch access prerequisites", () => {
  beforeEach(() => {
    findMany.mockReset();
  });

  it("requires both read and write for full dispatch create flow", async () => {
    const grants = DEFAULT_ROLE_PERMISSIONS[Role.LOGISTICS_EXECUTIVE];
    mockRoleGrants(Role.LOGISTICS_EXECUTIVE, grants);

    await expect(
      roleHasPermission(Role.LOGISTICS_EXECUTIVE, "dispatch", "read"),
    ).resolves.toBe(true);
    await expect(
      roleHasPermission(Role.LOGISTICS_EXECUTIVE, "dispatch", "write"),
    ).resolves.toBe(true);
  });

  it("documents why write-only grants fail route guards", async () => {
    mockRoleGrants(Role.USER, [
      { resource: "dashboard", action: "read" },
      { resource: "dispatch", action: "write" },
    ]);

    await expect(
      roleHasPermission(Role.USER, "dispatch", "read"),
    ).resolves.toBe(false);
    await expect(
      roleHasPermission(Role.USER, "dispatch", "write"),
    ).resolves.toBe(true);
  });
});
