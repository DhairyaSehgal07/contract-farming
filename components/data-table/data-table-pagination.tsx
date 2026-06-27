"use client";

import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

type DataTablePaginationProps<TData> = {
  table: Table<TData>;
  pageIndex: number;
  pageCount: number;
};

export function DataTablePagination<TData>({
  table,
  pageIndex,
  pageCount,
}: DataTablePaginationProps<TData>) {
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageCount > 0 && pageIndex < pageCount - 1;

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!canPreviousPage}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!canNextPage}
      >
        Next
      </Button>
    </div>
  );
}
