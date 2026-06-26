import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { RoleMatrixSection } from "@/components/permissions/roles/role-matrix-section";
import { prefetchRolePermissionMatrix } from "@/lib/query/prefetch-permissions";

export default async function PermissionsRolesPage() {
  const queryClient = await prefetchRolePermissionMatrix();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RoleMatrixSection />
    </HydrationBoundary>
  );
}
