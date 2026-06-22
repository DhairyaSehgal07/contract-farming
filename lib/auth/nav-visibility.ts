import { navItems } from "@/components/layout/nav-config";
import { roleHasPermission } from "@/lib/auth/authorization";
import type { AppRole } from "@/lib/auth/roles";

export async function getVisibleNavHrefs(role: AppRole): Promise<string[]> {
  const entries = await Promise.all(
    navItems.map(async (item) => {
      if (!item.requiredAppPermission) {
        return item.href;
      }

      const allowed = await roleHasPermission(
        role,
        item.requiredAppPermission.resource,
        item.requiredAppPermission.action,
      );

      return allowed ? item.href : null;
    }),
  );

  return entries.filter((href): href is string => href !== null);
}
