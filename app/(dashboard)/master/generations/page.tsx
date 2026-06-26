import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { generationLookupConfig } from "@/components/master/lookup/lookup-config";
import { LookupSection } from "@/components/master/lookup/lookup-section";
import { prefetchGenerations } from "@/lib/query/prefetch-master";

export default async function GenerationsPage() {
  const queryClient = await prefetchGenerations();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LookupSection config={generationLookupConfig} />
    </HydrationBoundary>
  );
}
