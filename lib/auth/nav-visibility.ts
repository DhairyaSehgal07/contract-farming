import { navItems } from "@/components/layout/nav-config";
import {
  getRolePermissions,
} from "@/lib/auth/authorization";
import { MANAGING_DIRECTOR_ROLE, type AppRole } from "@/lib/auth/roles";
import type { Role } from "@/app/generated/prisma/client";

export async function getVisibleNavHrefs(role: AppRole): Promise<string[]> {
  const permissions =
    role === MANAGING_DIRECTOR_ROLE
      ? null
      : await getRolePermissions(role as Role);

  return navItems
    .filter((item) => {
      if (!item.requiredAppPermission) {
        return true;
      }

      if (role === MANAGING_DIRECTOR_ROLE) {
        return true;
      }

      const { resource, action } = item.requiredAppPermission;
      return permissions?.has(`${resource}:${action}`) ?? false;
    })
    .map((item) => item.href);
}
