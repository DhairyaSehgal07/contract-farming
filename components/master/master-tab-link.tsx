"use client";

import Link, { useLinkStatus } from "next/link";
import type { MasterNavItem } from "@/components/master/master-nav-config";
import { TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type MasterTabLinkProps = {
  item: MasterNavItem;
};

function MasterTabLinkLabel({ item }: MasterTabLinkProps) {
  const { pending } = useLinkStatus();
  const Icon = item.icon;

  return (
    <>
      <Icon className={cn(pending && "opacity-60")} />
      <span className={cn(pending && "opacity-60")}>{item.label}</span>
    </>
  );
}

export function MasterTabLink({ item }: MasterTabLinkProps) {
  return (
    <TabsTrigger value={item.value} asChild>
      <Link href={item.href} prefetch>
        <MasterTabLinkLabel item={item} />
      </Link>
    </TabsTrigger>
  );
}
