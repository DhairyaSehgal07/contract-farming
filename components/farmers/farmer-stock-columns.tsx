"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { FarmerStockRow } from "@/app/actions/transfer/stock-transfers";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

export function createFarmerStockColumns(): ColumnDef<FarmerStockRow>[] {
  return [
    {
      id: "variety",
      accessorFn: (row) => row.variety.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Variety" />
      ),
    },
    {
      id: "size",
      accessorFn: (row) => row.size.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Size" />
      ),
    },
    {
      id: "generation",
      accessorFn: (row) => row.generation.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Generation" />
      ),
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Quantity" />
      ),
    },
  ];
}
