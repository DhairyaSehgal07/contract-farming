import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { FarmersSection } from "@/components/farmers/farmers-section";
import { getEffectiveRole, roleHasPermission } from "@/lib/auth/authorization";
import { getServerSession } from "@/lib/auth/session";
import { prefetchFarmers } from "@/lib/query/prefetch-farmer";

export default async function FarmersPage() {
  const session = await getServerSession();
  const role = session ? getEffectiveRole(session) : null;
  const canWriteMaster = role
    ? await roleHasPermission(role, "master", "write")
    : false;

  const queryClient = await prefetchFarmers();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FarmersSection canWriteMaster={canWriteMaster} />
    </HydrationBoundary>
  );
}
