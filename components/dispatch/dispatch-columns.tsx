"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { DispatchRow } from "@/app/actions/dispatch/dispatches";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { parseDateOnly } from "@/lib/date";

function formatDate(value: string | null) {
  if (!value) return "—";
  return parseDateOnly(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDecimal(value: string | null) {
  return value ?? "—";
}

function formatRelationName(value: { name: string } | null) {
  return value?.name ?? "—";
}

export function createDispatchColumns(): ColumnDef<DispatchRow>[] {
  return [
    {
      accessorKey: "dispatchDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Dispatch date" />
      ),
      cell: ({ row }) => formatDate(row.original.dispatchDate),
    },
    {
      accessorKey: "dateOfReceiving",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Receiving date" />
      ),
      cell: ({ row }) => formatDate(row.original.dateOfReceiving),
    },
    {
      id: "fromLocation",
      accessorFn: (row) => row.location?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="From location" />
      ),
      cell: ({ row }) => formatRelationName(row.original.location),
    },
    {
      id: "toLocation",
      accessorFn: (row) => row.toLocation?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="To location" />
      ),
      cell: ({ row }) => formatRelationName(row.original.toLocation),
    },
    {
      id: "generation",
      accessorFn: (row) => row.generation?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Generation" />
      ),
      cell: ({ row }) => formatRelationName(row.original.generation),
    },
    {
      accessorKey: "netWeight",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Net weight" />
      ),
      cell: ({ row }) => formatDecimal(row.original.netWeight),
    },
    {
      accessorKey: "truckNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Truck number" />
      ),
      cell: ({ row }) => row.original.truckNumber ?? "—",
    },
    {
      accessorKey: "driverMobileNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Driver mobile" />
      ),
      cell: ({ row }) => row.original.driverMobileNumber ?? "—",
    },
  ];
}
