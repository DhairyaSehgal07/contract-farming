import { KeyRound, Shield, Users, type LucideIcon } from "lucide-react";

export type PermissionsNavItem = {
  label: string;
  value: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

export const permissionsNavItems: PermissionsNavItem[] = [
  {
    label: "Roles",
    value: "roles",
    href: "/permissions/roles",
    icon: Shield,
    description: "Configure app permissions per role",
  },
  {
    label: "Users",
    value: "users",
    href: "/permissions/users",
    icon: Users,
    description: "Manage user roles, bans, and impersonation",
  },
  {
    label: "Sessions",
    value: "sessions",
    href: "/permissions/sessions",
    icon: KeyRound,
    description: "View and revoke active sessions",
  },
];

export function isPermissionsNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getPermissionsTabValue(pathname: string) {
  return (
    permissionsNavItems.find((item) => isPermissionsNavActive(pathname, item.href))
      ?.value ?? "roles"
  );
}
