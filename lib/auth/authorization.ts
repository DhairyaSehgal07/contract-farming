import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import { Role } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import {
  type AppAction,
  type AppResource,
  MANAGING_DIRECTOR_ROLE,
} from "@/lib/auth/permission-catalog";
import { isAppRole, type AppRole } from "@/lib/auth/roles";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import {
  type ActionResult,
  actionError,
} from "@/lib/schemas/master/action-result";

type SessionLike = NonNullable<Awaited<ReturnType<typeof getServerSession>>>;

export function getEffectiveRole(session: SessionLike): AppRole {
  const role = session.user.role;
  if (typeof role === "string" && isAppRole(role)) {
    return role;
  }
  return "USER";
}

function toPrismaRole(role: AppRole): Role {
  return role as Role;
}

async function loadRolePermissionsFromDb(role: Role): Promise<string[]> {
  const rows = await prisma.rolePermission.findMany({
    where: { role },
    select: { resource: true, action: true },
  });
  return rows.map((row) => `${row.resource}:${row.action}`);
}

function getCachedRolePermissions(role: Role): Promise<string[]> {
  return unstable_cache(
    async () => loadRolePermissionsFromDb(role),
    ["role-permissions", role],
    { tags: ["role-permissions"] },
  )();
}

export async function getRolePermissions(role: Role): Promise<Set<string>> {
  const grants = await getCachedRolePermissions(role);
  return new Set(Array.isArray(grants) ? grants : []);
}

export async function roleHasPermission(
  role: AppRole,
  resource: AppResource,
  action: AppAction,
): Promise<boolean> {
  if (role === MANAGING_DIRECTOR_ROLE) {
    return true;
  }

  const permissions = await getRolePermissions(toPrismaRole(role));
  return permissions.has(`${resource}:${action}`);
}

export async function sessionHasAppPermission(
  session: SessionLike,
  resource: AppResource,
  action: AppAction,
): Promise<boolean> {
  return roleHasPermission(getEffectiveRole(session), resource, action);
}

export async function requireAppPermissionAction(
  resource: AppResource,
  action: AppAction,
): Promise<ActionResult<never> | null> {
  const session = await getServerSession();
  if (!session) {
    return actionError("You must be signed in to perform this action.");
  }

  const allowed = await sessionHasAppPermission(session, resource, action);
  if (!allowed) {
    return actionError("You do not have permission to perform this action.");
  }

  return null;
}

export async function requireManagingDirectorAdminAction(): Promise<
  ActionResult<never> | null
> {
  const session = await getServerSession();
  if (!session) {
    return actionError("You must be signed in to perform this action.");
  }

  const result = await auth.api.userHasPermission({
    headers: await headers(),
    body: { permissions: { user: ["list"] } },
  });

  if (!result.success) {
    return actionError("You do not have permission to perform this action.");
  }

  return null;
}

export async function canAccessPermissionsSection(
  session: SessionLike,
): Promise<boolean> {
  const adminResult = await auth.api.userHasPermission({
    headers: await headers(),
    body: { permissions: { user: ["list"] } },
  });

  if (!adminResult.success) {
    return false;
  }

  return sessionHasAppPermission(session, "permissions", "read");
}
