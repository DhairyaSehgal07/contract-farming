import { Database, LayoutDashboard, type LucideIcon } from "lucide-react";

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  activePaths: string[];
};

export const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    activePaths: ["/"],
  },
  {
    name: "Master",
    href: "/master",
    icon: Database,
    activePaths: ["/master"],
  },
];

export const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/master": "Master",
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
