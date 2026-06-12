"use client";

import { usePathname } from "next/navigation";
import {
  getPermissionsTabValue,
  permissionsNavItems,
} from "@/components/permissions/permissions-nav-config";
import { PermissionsTabLink } from "@/components/permissions/permissions-tab-link";
import { Tabs, TabsList } from "@/components/ui/tabs";

export function PermissionsTabs() {
  const pathname = usePathname();
  const activeTab = getPermissionsTabValue(pathname);

  return (
    <Tabs value={activeTab}>
      <TabsList variant="line" className="w-full justify-start">
        {permissionsNavItems.map((item) => (
          <PermissionsTabLink key={item.value} item={item} />
        ))}
      </TabsList>
    </Tabs>
  );
}
