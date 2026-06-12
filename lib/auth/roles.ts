export const ROLES = [
  "MANAGING_DIRECTOR",
  "PROGRAMME_MANAGER",
  "ACCOUNTS_SETTLEMENTS_MANAGER",
  "FIELD_OPERATIONS_MANAGER",
  "ACCOUNTS_SEEDS_SUPPLY_MANAGER",
  "LOGISTICS_EXECUTIVE",
  "FIELD_OFFICER",
  "USER",
] as const;

export type AppRole = (typeof ROLES)[number];

export const MANAGING_DIRECTOR_ROLE: AppRole = "MANAGING_DIRECTOR";

export const EDITABLE_ROLES = ROLES.filter(
  (role) => role !== MANAGING_DIRECTOR_ROLE,
);

export type EditableRole = (typeof EDITABLE_ROLES)[number];

export function isAppRole(value: string): value is AppRole {
  return (ROLES as readonly string[]).includes(value);
}

export function formatRoleLabel(role: string) {
  return role
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}
