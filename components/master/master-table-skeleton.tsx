import { Skeleton } from "@/components/ui/skeleton";

type MasterTableSkeletonProps = {
  columnCount?: number;
  rowCount?: number;
  showSearch?: boolean;
};

const COLUMN_KEYS = ["a", "b", "c", "d", "e", "f"] as const;
const ROW_KEYS = ["one", "two", "three", "four", "five", "six"] as const;

export function MasterTableSkeleton({
  columnCount = 3,
  rowCount = 5,
  showSearch = true,
}: MasterTableSkeletonProps) {
  const columns = COLUMN_KEYS.slice(0, columnCount);
  const rows = ROW_KEYS.slice(0, rowCount);

  return (
    <div className="space-y-4">
      <output className="sr-only" aria-live="polite">
        Loading table
      </output>
      {showSearch ? <Skeleton className="h-9 w-full max-w-sm" /> : null}

      <div className="overflow-hidden rounded-md border">
        <div className="border-b bg-muted/50 px-3 py-3">
          <div className="flex gap-4">
            {columns.map((key) => (
              <Skeleton key={`header-${key}`} className="h-4 flex-1" />
            ))}
          </div>
        </div>

        {rows.map((rowKey) => (
          <div key={`row-${rowKey}`} className="flex gap-4 border-t px-4 py-4">
            {columns.map((colKey) => (
              <Skeleton
                key={`cell-${rowKey}-${colKey}`}
                className="h-4 flex-1"
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}
