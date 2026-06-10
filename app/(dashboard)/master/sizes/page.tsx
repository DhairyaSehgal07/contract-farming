import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { sizeLookupConfig } from "@/components/master/lookup/lookup-config";
import { LookupSection } from "@/components/master/lookup/lookup-section";
import { prefetchSizes } from "@/lib/query/prefetch-master";

export default async function SizesPage() {
  const queryClient = await prefetchSizes();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LookupSection config={sizeLookupConfig} />
    </HydrationBoundary>
  );
}
