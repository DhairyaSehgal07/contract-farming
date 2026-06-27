"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type GroupingState,
  type PaginationState,
  type SortingState,
  type Updater,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronRight, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumn?: string;
  filterPlaceholder?: string;
  showPagination?: boolean;
  grouping?: GroupingState;
};

function applyUpdater<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === "function"
    ? (updater as (old: T) => T)(previous)
    : updater;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  filterPlaceholder = "Search…",
  showPagination = true,
  grouping,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const groupingEnabled = grouping !== undefined && grouping.length > 0;
  const paginationEnabled = showPagination && !groupingEnabled;
  const tablePagination: PaginationState = groupingEnabled
    ? { pageIndex: 0, pageSize: Math.max(data.length, 1) }
    : pagination;

  useEffect(() => {
    if (groupingEnabled) {
      setExpanded({});
    }
  }, [groupingEnabled, grouping?.join("|")]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination: tablePagination,
      ...(groupingEnabled ? { grouping, expanded } : {}),
    },
    autoResetPageIndex: false,
    autoResetExpanded: false,
    paginateExpandedRows: false,
    onSortingChange: (updater) => {
      setSorting((previous) => applyUpdater(updater, previous));
      if (paginationEnabled) {
        setPagination((previous) => ({ ...previous, pageIndex: 0 }));
      }
    },
    onColumnFiltersChange: (updater) => {
      setColumnFilters((previous) => applyUpdater(updater, previous));
      if (paginationEnabled) {
        setPagination((previous) => ({ ...previous, pageIndex: 0 }));
      }
    },
    ...(paginationEnabled
      ? {
          onPaginationChange: (updater) => {
            setPagination((previous) => applyUpdater(updater, previous));
          },
        }
      : {}),
    ...(groupingEnabled
      ? {
          onExpandedChange: setExpanded,
          groupedColumnMode: "reorder" as const,
          getGroupedRowModel: getGroupedRowModel(),
          getExpandedRowModel: getExpandedRowModel(),
        }
      : {}),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const pageCount = table.getPageCount();

  useEffect(() => {
    if (!paginationEnabled || pageCount <= 0) {
      return;
    }

    if (pagination.pageIndex >= pageCount) {
      setPagination((previous) => ({
        ...previous,
        pageIndex: pageCount - 1,
      }));
    }
  }, [pageCount, pagination.pageIndex, paginationEnabled]);

  function handleFilterChange(value: string) {
    table.getColumn(filterColumn ?? "")?.setFilterValue(value);
    if (paginationEnabled) {
      setPagination((previous) => ({ ...previous, pageIndex: 0 }));
    }
  }

  return (
    <div className="space-y-4">
      {filterColumn ? (
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={filterPlaceholder}
            value={
              (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) => handleFilterChange(event.target.value)}
            aria-label="Search table"
          />
        </div>
      ) : null}

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(cell.column.getIndex() === 0 && row.depth > 0 && "pl-8")}
                    >
                      {cell.getIsGrouped() ? (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="size-6"
                            onClick={row.getToggleExpandedHandler()}
                            aria-expanded={row.getIsExpanded()}
                            aria-label={
                              row.getIsExpanded()
                                ? "Collapse group"
                                : "Expand group"
                            }
                          >
                            <ChevronRight
                              className={cn(
                                "size-4 transition-transform",
                                row.getIsExpanded() && "rotate-90",
                              )}
                            />
                          </Button>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </div>
                      ) : cell.getIsAggregated() ? (
                        flexRender(
                          cell.column.columnDef.aggregatedCell ??
                            cell.column.columnDef.cell,
                          cell.getContext(),
                        )
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {paginationEnabled ? (
        <DataTablePagination
          table={table}
          pageIndex={pagination.pageIndex}
          pageCount={pageCount}
        />
      ) : null}
    </div>
  );
}
