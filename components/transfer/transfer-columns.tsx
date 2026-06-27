"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import type { StockTransferRow } from "@/app/actions/transfer/stock-transfers";
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

function formatFarmer(farmer: { name: string; accountNumber: string }) {
  return `${farmer.name} (#${farmer.accountNumber})`;
}

export function createTransferColumns(): ColumnDef<StockTransferRow>[] {
  return [
    {
      accessorKey: "transferDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Transfer date" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/transfer/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {formatDate(row.original.transferDate)}
        </Link>
      ),
    },
    {
      id: "fromFarmer",
      accessorFn: (row) => row.fromFarmer.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="From farmer" />
      ),
      cell: ({ row }) => formatFarmer(row.original.fromFarmer),
    },
    {
      id: "toFarmer",
      accessorFn: (row) => row.toFarmer.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="To farmer" />
      ),
      cell: ({ row }) => formatFarmer(row.original.toFarmer),
    },
    {
      accessorKey: "totalQuantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Bags transferred" />
      ),
      cell: ({ row }) => row.original.totalQuantity,
    },
    {
      id: "createdBy",
      accessorFn: (row) => row.createdBy.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created by" />
      ),
      cell: ({ row }) => row.original.createdBy.name,
    },
  ];
}
