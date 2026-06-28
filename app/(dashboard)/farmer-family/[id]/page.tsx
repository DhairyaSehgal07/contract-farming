import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getFarmerFamilyProfile } from "@/app/actions/farmer/farmer-family-profile";
import { FamilyDetailSection } from "@/components/farmer-family/family-detail-section";
import { MasterTableSkeleton } from "@/components/master/master-table-skeleton";
import { getFarmerDetailPermissions } from "@/lib/auth/farmer-page-permissions";
import { getServerSession } from "@/lib/auth/session";
import { prefetchFarmerFamilyDetail } from "@/lib/query/prefetch-farmer-family";

type FarmerFamilyDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function FarmerFamilyDetailPage({
  params,
}: FarmerFamilyDetailPageProps) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) {
    notFound();
  }

  const result = await getFarmerFamilyProfile(id);
  if (!result.success) {
    notFound();
  }

  const permissions = await getFarmerDetailPermissions(session);
  const queryClient = await prefetchFarmerFamilyDetail(id, {
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
        <FamilyDetailSection id={id} {...permissions} />
      </Suspense>
    </HydrationBoundary>
  );
}
