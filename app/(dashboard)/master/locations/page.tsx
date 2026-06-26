import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { LocationsSection } from "@/components/master/locations/locations-section";
import { prefetchLocations } from "@/lib/query/prefetch-master";

export default async function LocationsPage() {
  const queryClient = await prefetchLocations();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LocationsSection />
    </HydrationBoundary>
  );
}
