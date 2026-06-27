"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import type { FarmerReceivedLotRow } from "@/app/actions/farmer/farmer-profile";
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

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatSizeLines(row: FarmerReceivedLotRow) {
  return row.sizeLines
    .map(
      (line) =>
        `${line.size.name} / ${line.generation.name}: ${line.quantity}`,
    )
    .join(", ");
}

export function createFarmerReceivedLotColumns(): ColumnDef<FarmerReceivedLotRow>[] {
  return [
    {
      accessorKey: "dispatchDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Dispatch date" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/dispatch/${row.original.dispatchId}`}
          className="font-medium hover:underline"
        >
          {formatDate(row.original.dispatchDate)}
        </Link>
      ),
    },
    {
      id: "variety",
      accessorFn: (row) => row.variety.name,
      header: "Variety",
    },
    {
      accessorKey: "receivedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Received at" />
      ),
      cell: ({ row }) => formatDateTime(row.original.receivedAt),
    },
    {
      id: "receivedBy",
      accessorFn: (row) => row.receivedBy?.name ?? "",
      header: "Received by",
      cell: ({ row }) => row.original.receivedBy?.name ?? "—",
    },
    {
      accessorKey: "totalQuantity",
      header: "Total qty",
    },
    {
      id: "sizeLines",
      header: "Size lines",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatSizeLines(row.original)}</span>
      ),
    },
  ];
}
