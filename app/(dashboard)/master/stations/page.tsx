import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { StationsSection } from "@/components/master/stations/stations-section";
import { prefetchStations } from "@/lib/query/prefetch-master";

export default async function StationsPage() {
  const queryClient = await prefetchStations();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StationsSection />
    </HydrationBoundary>
  );
}
