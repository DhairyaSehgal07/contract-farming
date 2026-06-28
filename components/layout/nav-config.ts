import {
  ArrowLeftRight,
  ClipboardList,
  Database,
  LayoutDashboard,
  Shield,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { AppAction, AppResource } from "@/lib/auth/permission-catalog";

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  activePaths: string[];
  requiredAppPermission?: {
    resource: AppResource;
    action: AppAction;
  };
  requiredAnyAppPermissions?: {
    resource: AppResource;
    action: AppAction;
  }[];
};

export const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    activePaths: ["/"],
    requiredAppPermission: { resource: "dashboard", action: "read" },
  },
  {
    name: "Requisition",
    href: "/requisition",
    icon: ClipboardList,
    activePaths: ["/requisition"],
    requiredAppPermission: { resource: "requisition", action: "read" },
  },
  {
    name: "Dispatch",
    href: "/dispatch",
    icon: Truck,
    activePaths: ["/dispatch"],
    requiredAppPermission: { resource: "dispatch", action: "read" },
  },
  {
    name: "Farmers",
    href: "/farmers",
    icon: Users,
    activePaths: ["/farmers", "/fields", "/farmer-family"],
    requiredAnyAppPermissions: [
      { resource: "master", action: "read" },
      { resource: "requisition", action: "read" },
      { resource: "dispatch", action: "read" },
      { resource: "transfer", action: "read" },
    ],
  },
  {
    name: "Transfer",
    href: "/transfer",
    icon: ArrowLeftRight,
    activePaths: ["/transfer"],
    requiredAppPermission: { resource: "transfer", action: "read" },
  },
  {
    name: "Master",
    href: "/master",
    icon: Database,
    activePaths: ["/master"],
    requiredAppPermission: { resource: "master", action: "read" },
  },
  {
    name: "Permissions",
    href: "/permissions",
    icon: Shield,
    activePaths: ["/permissions"],
    requiredAppPermission: { resource: "permissions", action: "read" },
  },
];

export const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/master": "Master",
  "/permissions": "Permissions",
  "/requisition": "Requisition",
  "/dispatch": "Dispatch",
  "/dispatch/new": "New dispatch",
  "/transfer": "Transfer",
  "/transfer/new": "New transfer",
  "/farmers": "Farmers",
  "/fields": "Fields",
  "/permissions/roles": "Role permissions",
  "/permissions/users": "Users",
  "/permissions/sessions": "Sessions",
  "/master/stations": "Stations",
  "/master/varieties": "Varieties",
  "/master/sizes": "Sizes",
  "/master/generations": "Generations",
};

export function isPathActive(pathname: string, activePaths: string[]) {
  return activePaths.some((path) => {
    if (path === "/") {
      return pathname === "/";
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  });
}

export function getPageTitle(pathname: string) {
  if (routeTitles[pathname]) {
    return routeTitles[pathname];
  }

  const matchedPath = Object.keys(routeTitles)
    .filter((path) => path !== "/")
    .sort((a, b) => b.length - a.length)
    .find((path) => pathname === path || pathname.startsWith(`${path}/`));

  return matchedPath ? routeTitles[matchedPath] : "Dashboard";
}
