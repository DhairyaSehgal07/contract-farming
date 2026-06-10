import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { StationsSection } from "@/components/master/stations/stations-section";
import { StationsSectionSkeleton } from "@/components/master/stations/stations-section-skeleton";
import { prefetchStations } from "@/lib/query/prefetch-master";

export default async function StationsPage() {
  const queryClient = await prefetchStations();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<StationsSectionSkeleton />}>
        <StationsSection />
      </Suspense>
    </HydrationBoundary>
  );
}
