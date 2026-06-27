"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import type { FarmerDispatchRow } from "@/app/actions/farmer/farmer-profile";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { parseDateOnly } from "@/lib/date";

function formatDate(value: string | null) {
  if (!value) return "—";
  return parseDateOnly(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function createFarmerDispatchColumns(): ColumnDef<FarmerDispatchRow>[] {
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
      accessorKey: "status",
      header: "Dispatch status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "CLOSED" ? "default" : "outline"}>
          {row.original.status === "CLOSED" ? "Closed" : "Open"}
        </Badge>
      ),
    },
    {
      id: "variety",
      accessorFn: (row) => row.variety.name,
      header: "Variety",
    },
    {
      id: "location",
      accessorFn: (row) => row.location?.name ?? "",
      header: "Location",
      cell: ({ row }) => row.original.location?.name ?? "—",
    },
    {
      accessorKey: "lotStatus",
      header: "Lot status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.lotStatus === "RECEIVED" ? "default" : "outline"}
        >
          {row.original.lotStatus === "RECEIVED" ? "Received" : "Pending"}
        </Badge>
      ),
    },
    {
      accessorKey: "receivedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Received at" />
      ),
      cell: ({ row }) => formatDateTime(row.original.receivedAt),
    },
  ];
}
