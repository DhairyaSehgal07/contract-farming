import {
  APP_RESOURCES,
  PERMISSION_CATALOG,
  type AppAction,
  type AppResource,
} from "@/lib/auth/permission-catalog";

export type RoleMatrixRow = {
  resource: AppResource;
  read: boolean | null;
  write: boolean | null;
  approve: boolean | null;
};

function grantKey(resource: AppResource, action: AppAction) {
  return `${resource}:${action}`;
}

function actionValue(
  resource: AppResource,
  action: AppAction,
  grants: Record<string, boolean>,
): boolean | null {
  const catalogActions = PERMISSION_CATALOG[resource];
  if (!(catalogActions as readonly string[]).includes(action)) {
    return null;
  }
  return Boolean(grants[grantKey(resource, action)]);
}

export function buildRoleMatrixRows(
  grants: Record<string, boolean>,
): RoleMatrixRow[] {
  return APP_RESOURCES.map((resource) => ({
    resource,
    read: actionValue(resource, "read", grants),
    write: actionValue(resource, "write", grants),
    approve: actionValue(resource, "approve", grants),
  }));
}

export function rowHasAnyGrant(row: RoleMatrixRow): boolean {
  return row.read === true || row.write === true || row.approve === true;
}
