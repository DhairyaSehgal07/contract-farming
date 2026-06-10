"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  getMasterTabValue,
  masterNavItems,
} from "@/components/master/master-nav-config";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function MasterTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = getMasterTabValue(pathname);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        const item = masterNavItems.find((entry) => entry.value === value);
        if (item) router.push(item.href);
      }}
    >
      <TabsList variant="line" className="w-full justify-start">
        {masterNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <TabsTrigger key={item.value} value={item.value}>
              <Icon />
              {item.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
