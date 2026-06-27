import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getFarmer } from "@/app/actions/master/farmers";
import { FarmerDetailSection } from "@/components/farmers/farmer-detail-section";
import { MasterTableSkeleton } from "@/components/master/master-table-skeleton";
import { getFarmerDetailPermissions } from "@/lib/auth/farmer-page-permissions";
import { getServerSession } from "@/lib/auth/session";
import { prefetchFarmerDetail } from "@/lib/query/prefetch-farmer";

type FarmerDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function FarmerDetailPage({
  params,
}: FarmerDetailPageProps) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) {
    notFound();
  }

  const result = await getFarmer(id);
  if (!result.success) {
    notFound();
  }

  const permissions = await getFarmerDetailPermissions(session);
  const queryClient = await prefetchFarmerDetail(id, {
    canReadRequisitions: permissions.canReadRequisitions,
    canReadDispatches: permissions.canReadDispatches,
    canReadTransfer: permissions.canReadTransfer,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense
        fallback={
          <MasterTableSkeleton columnCount={4} rowCount={4} />
        }
      >
        <FarmerDetailSection id={id} {...permissions} />
      </Suspense>
    </HydrationBoundary>
  );
}
