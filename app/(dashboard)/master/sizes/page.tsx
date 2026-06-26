import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { SizesSection } from "@/components/master/sizes/sizes-section";
import { prefetchSizes } from "@/lib/query/prefetch-master";

export default async function SizesPage() {
  const queryClient = await prefetchSizes();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SizesSection />
    </HydrationBoundary>
  );
}
