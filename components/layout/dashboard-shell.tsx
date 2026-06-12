"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

type DashboardUser = {
  name: string;
  email: string;
  image?: string | null;
};

export type NavVisibility = Record<string, boolean>;

export function DashboardShell({
  user,
  navVisibility,
  children,
}: {
  user: DashboardUser;
  navVisibility: NavVisibility;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar navVisibility={navVisibility} />
        <SidebarInset className="md:peer-data-[variant=inset]:mt-0 md:peer-data-[variant=inset]:rounded-t-none">
          <AppTopbar user={user} />
          <main className="flex flex-1 flex-col p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
