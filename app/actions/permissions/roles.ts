"use server";

import { updateTag } from "next/cache";
import { Role } from "@/app/generated/prisma/client";
import { requireManagingDirectorAdminAction } from "@/lib/auth/authorization";
import {
  APP_ACTIONS,
  APP_RESOURCES,
  catalogGrants,
  EDITABLE_ROLES,
  type AppPermissionGrant,
} from "@/lib/auth/permission-catalog";
import type { AppRole, EditableRole } from "@/lib/auth/roles";
import prisma from "@/lib/prisma";
import {
  type ActionResult,
  actionError,
  actionSuccess,
} from "@/lib/schemas/master/action-result";
import {
  type UpdateRolePermissionsInput,
  updateRolePermissionsSchema,
} from "@/lib/schemas/permissions/roles";

export type RolePermissionMatrix = {
  roles: EditableRole[];
  resources: typeof APP_RESOURCES;
  actions: typeof APP_ACTIONS;
  grantsByRole: Record<AppRole, AppPermissionGrant[]>;
};

export async function getRolePermissionMatrix(): Promise<
  ActionResult<RolePermissionMatrix>
> {
  const authError = await requireManagingDirectorAdminAction();
  if (authError) return authError;

  try {
    const rows = await prisma.rolePermission.findMany({
      orderBy: [{ role: "asc" }, { resource: "asc" }, { action: "asc" }],
    });

    const grantsByRole = Object.fromEntries(
      EDITABLE_ROLES.map((role) => [role, [] as AppPermissionGrant[]]),
    ) as Record<AppRole, AppPermissionGrant[]>;

    for (const row of rows) {
      if (row.role === Role.MANAGING_DIRECTOR) continue;
      grantsByRole[row.role].push({
        resource: row.resource as AppPermissionGrant["resource"],
        action: row.action as AppPermissionGrant["action"],
      });
    }

    return actionSuccess({
      roles: EDITABLE_ROLES,
      resources: APP_RESOURCES,
      actions: APP_ACTIONS,
      grantsByRole,
    });
  } catch {
    return actionError("Failed to load role permissions.");
  }
}

export async function updateRolePermissions(
  input: UpdateRolePermissionsInput,
): Promise<ActionResult<void>> {
  const authError = await requireManagingDirectorAdminAction();
  if (authError) return authError;

  const parsed = updateRolePermissionsSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const { role, grants } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { role } });
      if (grants.length > 0) {
        await tx.rolePermission.createMany({
          data: grants.map((grant) => ({
            role,
            resource: grant.resource,
            action: grant.action,
          })),
        });
      }
    });

    updateTag("role-permissions");
    return actionSuccess(undefined);
  } catch {
    return actionError("Failed to update role permissions.");
  }
}

export async function getCatalogGrants(): Promise<AppPermissionGrant[]> {
  return catalogGrants();
}
