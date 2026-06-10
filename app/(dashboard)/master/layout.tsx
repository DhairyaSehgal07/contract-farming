import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { MasterTabs } from "@/components/master/master-tabs";
import { prefetchAllMaster } from "@/lib/query/prefetch-master";

export default async function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = await prefetchAllMaster();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-medium">Master data</h1>
          <p className="text-muted-foreground">
            Manage stations, farmers, and product reference data.
          </p>
        </div>
        <MasterTabs />
        <div className="min-w-0">{children}</div>
      </div>
    </HydrationBoundary>
  );
}
