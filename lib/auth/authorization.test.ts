import { Role } from "@/app/generated/prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockSession } from "@/lib/auth/test-utils";

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
import { getEffectiveRole, roleHasPermission } from "@/lib/auth/authorization";

const findMany = vi.mocked(prisma.rolePermission.findMany);

describe("authorization", () => {
  beforeEach(() => {
    findMany.mockReset();
  });

  it("treats MANAGING_DIRECTOR as having all app permissions", async () => {
    const allowed = await roleHasPermission(
      Role.MANAGING_DIRECTOR,
      "permissions",
      "write",
    );

    expect(allowed).toBe(true);
    expect(findMany).not.toHaveBeenCalled();
  });

  it("checks DB grants for non-director roles", async () => {
    findMany.mockResolvedValue([
      {
        id: "1",
        role: Role.USER,
        resource: "dashboard",
        action: "read",
      },
    ]);

    await expect(
      roleHasPermission(Role.USER, "dashboard", "read"),
    ).resolves.toBe(true);
    await expect(roleHasPermission(Role.USER, "master", "read")).resolves.toBe(
      false,
    );
  });

  it("resolves effective role from session user role", () => {
    const session = {
      ...mockSession,
      user: {
        ...mockSession.user,
        role: Role.FIELD_OFFICER,
      },
    };

    expect(getEffectiveRole(session)).toBe(Role.FIELD_OFFICER);
  });
});
