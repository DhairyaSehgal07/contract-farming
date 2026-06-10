import { MasterTableSkeleton } from "@/components/master/master-table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

type MasterSectionSkeletonProps = {
  columnCount?: number;
  rowCount?: number;
  ariaLabel?: string;
};

export function MasterSectionSkeleton({
  columnCount = 3,
  rowCount = 5,
  ariaLabel = "Loading section",
}: MasterSectionSkeletonProps) {
  return (
    <div className="flex flex-col gap-6">
      <output className="sr-only" aria-live="polite">
        {ariaLabel}
      </output>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      <MasterTableSkeleton columnCount={columnCount} rowCount={rowCount} />
    </div>
  );
}
