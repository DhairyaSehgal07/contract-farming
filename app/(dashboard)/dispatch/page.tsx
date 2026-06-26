import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { DispatchesSection } from "@/components/dispatch/dispatches-section";
import { getEffectiveRole, roleHasPermission } from "@/lib/auth/authorization";
import { getServerSession } from "@/lib/auth/session";
import { prefetchDispatchList } from "@/lib/query/prefetch-dispatch";

export default async function DispatchPage() {
  const session = await getServerSession();
  const canWrite = session
    ? await roleHasPermission(getEffectiveRole(session), "dispatch", "write")
    : false;

  const queryClient = await prefetchDispatchList();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DispatchesSection canWrite={canWrite} />
    </HydrationBoundary>
  );
}
