import { MasterTableSkeleton } from "@/components/master/master-table-skeleton";
import { StationListSkeleton } from "@/components/master/stations/station-list-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type StationsSectionSkeletonProps = {
  showLocalities?: boolean;
};

export function StationsSectionSkeleton({
  showLocalities = false,
}: StationsSectionSkeletonProps) {
  return (
    <div className="flex flex-col gap-6">
      <output className="sr-only" aria-live="polite">
        Loading stations and localities
      </output>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid lg:grid-cols-2">
            <div className="flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="text-base">Stations</CardTitle>
              </CardHeader>
              <StationListSkeleton />
            </div>

            <div className="flex flex-col border-t lg:border-t-0 lg:border-l">
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-8 w-28" />
              </CardHeader>

              {showLocalities ? (
                <div className="p-4">
                  <MasterTableSkeleton columnCount={5} rowCount={4} />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 p-12">
                  <Skeleton className="size-10" />
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-64 max-w-full" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
