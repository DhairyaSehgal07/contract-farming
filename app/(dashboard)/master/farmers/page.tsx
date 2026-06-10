import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { FarmersSection } from "@/components/master/farmers/farmers-section";
import { prefetchFarmers } from "@/lib/query/prefetch-master";

export default async function FarmersPage() {
  const queryClient = await prefetchFarmers();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FarmersSection />
    </HydrationBoundary>
  );
}
