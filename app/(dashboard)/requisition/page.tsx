import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { RequisitionsSection } from "@/components/requisition/requisitions-section";
import { getEffectiveRole, roleHasPermission } from "@/lib/auth/authorization";
import { getServerSession } from "@/lib/auth/session";
import { requisitionKeys } from "@/lib/query/keys";
import { fetchRequisitions } from "@/lib/query/requisition-fetchers";
import { getQueryClient } from "@/lib/query/query-client";

export default async function RequisitionPage() {
  const session = await getServerSession();
  const canApprove = session
    ? await roleHasPermission(
        getEffectiveRole(session),
        "requisition",
        "approve",
      )
    : false;

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: requisitionKeys.list(),
    queryFn: fetchRequisitions,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RequisitionsSection canApprove={canApprove} />
    </HydrationBoundary>
  );
}
