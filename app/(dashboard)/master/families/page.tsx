import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { FamiliesSection } from "@/components/master/families/families-section";
import { prefetchFarmerFamilies } from "@/lib/query/prefetch-master";

export default async function FamiliesPage() {
  const queryClient = await prefetchFarmerFamilies();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FamiliesSection />
    </HydrationBoundary>
  );
}
