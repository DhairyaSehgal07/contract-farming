import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { getRequisition } from "@/app/actions/requisition/requisitions";
import { RequisitionDetailSection } from "@/components/requisition/requisition-detail-section";
import { getEffectiveRole, roleHasPermission } from "@/lib/auth/authorization";
import { getServerSession } from "@/lib/auth/session";
import { prefetchRequisition } from "@/lib/query/prefetch-requisition";

type RequisitionDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RequisitionDetailPage({
  params,
}: RequisitionDetailPageProps) {
  const { id } = await params;
  const session = await getServerSession();

  const role = session ? getEffectiveRole(session) : null;
  const canApprove = role
    ? await roleHasPermission(role, "requisition", "approve")
    : false;
  const canWrite = role
    ? await roleHasPermission(role, "requisition", "write")
    : false;

  const result = await getRequisition(id);
  if (!result.success) {
    notFound();
  }

  const queryClient = await prefetchRequisition(id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RequisitionDetailSection
        id={id}
        canApprove={canApprove}
        canWrite={canWrite}
      />
    </HydrationBoundary>
  );
}
