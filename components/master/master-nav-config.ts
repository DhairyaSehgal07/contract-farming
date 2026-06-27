import {
  Building2,
  Layers,
  type LucideIcon,
  MapPin,
  Ruler,
  Sprout,
  UsersRound,
} from "lucide-react";

export type MasterNavItem = {
  label: string;
  value: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

export const masterNavItems: MasterNavItem[] = [
  {
    label: "Stations",
    value: "stations",
    href: "/master/stations",
    icon: Building2,
    description: "Manage stations and their localities",
  },
  {
    label: "Families",
    value: "families",
    href: "/master/families",
    icon: UsersRound,
    description: "Manage farmer family groups and members",
  },
  {
    label: "Varieties",
    value: "varieties",
    href: "/master/varieties",
    icon: Sprout,
    description: "Manage crop variety reference data",
  },
  {
    label: "Locations",
    value: "locations",
    href: "/master/locations",
    icon: MapPin,
    description: "Manage location reference data",
  },
  {
    label: "Sizes",
    value: "sizes",
    href: "/master/sizes",
    icon: Ruler,
    description: "Manage size reference data",
  },
  {
    label: "Generations",
    value: "generations",
    href: "/master/generations",
    icon: Layers,
    description: "Manage generation reference data",
  },
];

export function isMasterNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getMasterTabValue(pathname: string) {
  return (
    masterNavItems.find((item) => isMasterNavActive(pathname, item.href))
      ?.value ?? "stations"
  );
}
