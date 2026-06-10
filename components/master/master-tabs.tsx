"use client";

import { usePathname } from "next/navigation";
import {
  getMasterTabValue,
  masterNavItems,
} from "@/components/master/master-nav-config";
import { MasterTabLink } from "@/components/master/master-tab-link";
import { Tabs, TabsList } from "@/components/ui/tabs";

export function MasterTabs() {
  const pathname = usePathname();
  const activeTab = getMasterTabValue(pathname);

  return (
    <Tabs value={activeTab}>
      <TabsList variant="line" className="w-full justify-start">
        {masterNavItems.map((item) => (
          <MasterTabLink key={item.value} item={item} />
        ))}
      </TabsList>
    </Tabs>
  );
}
