import { Role } from "@/app/generated/prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
import { getVisibleNavHrefs } from "@/lib/auth/nav-visibility";

const findMany = vi.mocked(prisma.rolePermission.findMany);

describe("getVisibleNavHrefs", () => {
  beforeEach(() => {
    findMany.mockReset();
  });

  it("includes requisition, dispatch, and master for field operations manager", async () => {
    findMany.mockResolvedValue([
      {
        id: "1",
        role: Role.FIELD_OPERATIONS_MANAGER,
        resource: "dashboard",
        action: "read",
      },
      {
        id: "2",
        role: Role.FIELD_OPERATIONS_MANAGER,
        resource: "master",
        action: "read",
      },
      {
        id: "3",
        role: Role.FIELD_OPERATIONS_MANAGER,
        resource: "master",
        action: "write",
      },
      {
        id: "4",
        role: Role.FIELD_OPERATIONS_MANAGER,
        resource: "requisition",
        action: "read",
      },
      {
        id: "5",
        role: Role.FIELD_OPERATIONS_MANAGER,
        resource: "dispatch",
        action: "read",
      },
    ]);

    await expect(getVisibleNavHrefs(Role.FIELD_OPERATIONS_MANAGER)).resolves.toEqual(
      ["/", "/requisition", "/dispatch", "/master"],
    );
  });

  it("excludes permission-gated routes without grants", async () => {
    findMany.mockResolvedValue([
      {
        id: "1",
        role: Role.FIELD_OFFICER,
        resource: "dashboard",
        action: "read",
      },
    ]);

    await expect(getVisibleNavHrefs(Role.FIELD_OFFICER)).resolves.toEqual(["/"]);
  });

  it("includes all app sections for managing director", async () => {
    await expect(getVisibleNavHrefs(Role.MANAGING_DIRECTOR)).resolves.toEqual([
      "/",
      "/requisition",
      "/dispatch",
      "/master",
      "/permissions",
    ]);
    expect(findMany).not.toHaveBeenCalled();
  });

  it("includes dispatch for logistics executive", async () => {
    findMany.mockResolvedValue([
      {
        id: "1",
        role: Role.LOGISTICS_EXECUTIVE,
        resource: "dashboard",
        action: "read",
      },
      {
        id: "2",
        role: Role.LOGISTICS_EXECUTIVE,
        resource: "dispatch",
        action: "read",
      },
      {
        id: "3",
        role: Role.LOGISTICS_EXECUTIVE,
        resource: "dispatch",
        action: "write",
      },
    ]);

    await expect(getVisibleNavHrefs(Role.LOGISTICS_EXECUTIVE)).resolves.toEqual(
      ["/", "/dispatch"],
    );
  });
});
