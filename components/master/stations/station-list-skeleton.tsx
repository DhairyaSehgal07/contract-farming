import { Skeleton } from "@/components/ui/skeleton";

const STATION_KEYS = ["alpha", "beta", "gamma", "delta"] as const;

export function StationListSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-2">
      <output className="sr-only" aria-live="polite">
        Loading stations
      </output>
      {STATION_KEYS.map((key) => (
        <div
          key={key}
          className="flex items-center justify-between rounded-lg px-2 py-1"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-2 py-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="size-9 shrink-0" />
        </div>
      ))}
    </div>
  );
}
