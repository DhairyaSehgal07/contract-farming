"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  computeRowSpans,
  type RowSpanCell,
} from "@/components/data-table/row-span";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flattenFamilyRows,
  type FamilyTableRow,
} from "@/lib/master/flatten-family-rows";

type FamiliesDataTableProps = {
  columns: ColumnDef<FamilyTableRow>[];
  data: FamilyTableRow[];
  filterPlaceholder?: string;
};

export function FamiliesDataTable({
  columns,
  data,
  filterPlaceholder = "Search families…",
}: FamiliesDataTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const rows = table.getRowModel().rows;

  computeRowSpans(rows, (row) => row.original.familyId);

  function handleFilterChange(value: string) {
    table.getColumn("name")?.setFilterValue(value);
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={filterPlaceholder}
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => handleFilterChange(event.target.value)}
          aria-label="Search table"
        />
      </div>

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
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const spanCell = cell as RowSpanCell<FamilyTableRow>;

                    if (spanCell.isRowSpanned) {
                      return null;
                    }

                    return (
                      <TableCell
                        key={cell.id}
                        rowSpan={spanCell.rowSpan}
                        className={
                          spanCell.rowSpan && spanCell.rowSpan > 1
                            ? "align-middle"
                            : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
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
    </div>
  );
}

export function useFlattenedFamilyRows(
  families: Parameters<typeof flattenFamilyRows>[0],
) {
  return useMemo(() => flattenFamilyRows(families), [families]);
}
