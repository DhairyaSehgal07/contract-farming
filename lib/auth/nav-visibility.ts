import { navItems } from "@/components/layout/nav-config";
import {
  getRolePermissions,
} from "@/lib/auth/authorization";
import { MANAGING_DIRECTOR_ROLE, type AppRole } from "@/lib/auth/roles";
import type { Role } from "@/app/generated/prisma/client";

function hasNavPermission(
  permissions: Set<string> | null,
  resource: string,
  action: string,
) {
  if (permissions === null) {
    return true;
  }

  return permissions.has(`${resource}:${action}`);
}

export async function getVisibleNavHrefs(role: AppRole): Promise<string[]> {
  const permissions =
    role === MANAGING_DIRECTOR_ROLE
      ? null
      : await getRolePermissions(role as Role);

  return navItems
    .filter((item) => {
      if (item.requiredAnyAppPermissions) {
        return item.requiredAnyAppPermissions.some((grant) =>
          hasNavPermission(permissions, grant.resource, grant.action),
        );
      }

      if (!item.requiredAppPermission) {
        return true;
      }

      const { resource, action } = item.requiredAppPermission;
      return hasNavPermission(permissions, resource, action);
    })
    .map((item) => item.href);
}
