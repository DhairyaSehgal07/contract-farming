import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { varietyLookupConfig } from "@/components/master/lookup/lookup-config";
import { LookupSection } from "@/components/master/lookup/lookup-section";
import { prefetchVarieties } from "@/lib/query/prefetch-master";

export default async function VarietiesPage() {
  const queryClient = await prefetchVarieties();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LookupSection config={varietyLookupConfig} />
    </HydrationBoundary>
  );
}
