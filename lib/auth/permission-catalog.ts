import {
  EDITABLE_ROLES,
  MANAGING_DIRECTOR_ROLE,
  ROLES,
  type AppRole,
} from "@/lib/auth/roles";

export const APP_RESOURCES = [
  "dashboard",
  "master",
  "permissions",
  "requisition",
] as const;

export type AppResource = (typeof APP_RESOURCES)[number];

export const APP_ACTIONS = ["read", "write"] as const;

export type AppAction = (typeof APP_ACTIONS)[number];

export type AppPermissionGrant = {
  resource: AppResource;
  action: AppAction;
};

export const PERMISSION_CATALOG: Record<AppResource, readonly AppAction[]> = {
  dashboard: ["read"],
  master: ["read", "write"],
  permissions: ["read", "write"],
  requisition: ["read", "write"],
};

export { MANAGING_DIRECTOR_ROLE, EDITABLE_ROLES, ROLES as ALL_ROLES };
export type { AppRole };

export function isValidAppPermission(
  resource: string,
  action: string,
): resource is AppResource {
  const actions = PERMISSION_CATALOG[resource as AppResource];
  if (!actions) return false;
  return (actions as readonly string[]).includes(action);
}

export function catalogGrants(): AppPermissionGrant[] {
  const grants: AppPermissionGrant[] = [];
  for (const resource of APP_RESOURCES) {
    for (const action of PERMISSION_CATALOG[resource]) {
      grants.push({ resource, action });
    }
  }
  return grants;
}
