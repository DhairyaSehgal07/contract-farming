import { getRolePermissionMatrix } from "@/app/actions/permissions/roles";

export async function fetchRolePermissionMatrix() {
  const result = await getRolePermissionMatrix();
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}
