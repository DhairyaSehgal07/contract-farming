"use client";

import Link, { useLinkStatus } from "next/link";
import type { PermissionsNavItem } from "@/components/permissions/permissions-nav-config";
import { TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type PermissionsTabLinkProps = {
  item: PermissionsNavItem;
};

function PermissionsTabLinkLabel({ item }: PermissionsTabLinkProps) {
  const { pending } = useLinkStatus();
  const Icon = item.icon;

  return (
    <>
      <Icon className={cn(pending && "opacity-60")} />
      <span className={cn(pending && "opacity-60")}>{item.label}</span>
    </>
  );
}

export function PermissionsTabLink({ item }: PermissionsTabLinkProps) {
  return (
    <TabsTrigger value={item.value} asChild>
      <Link href={item.href} prefetch>
        <PermissionsTabLinkLabel item={item} />
      </Link>
    </TabsTrigger>
  );
}
