import { permissionsKeys } from "@/lib/query/keys";
import { fetchRolePermissionMatrix } from "@/lib/query/permissions-fetchers";
import { getQueryClient } from "@/lib/query/query-client";

export async function prefetchRolePermissionMatrix() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: permissionsKeys.roleMatrix(),
    queryFn: fetchRolePermissionMatrix,
  });
  return queryClient;
}
