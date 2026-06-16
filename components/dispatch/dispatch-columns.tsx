"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import type { DispatchRow } from "@/app/actions/dispatch/dispatches";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

type DispatchColumnActions = {
  canWrite: boolean;
  onEdit: (row: DispatchRow) => void;
  onDelete: (row: DispatchRow) => void;
};

export function createDispatchColumns(
  actions?: DispatchColumnActions,
): ColumnDef<DispatchRow>[] {
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
      accessorKey: "toLocation",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="To location" />
      ),
      cell: ({ row }) => row.original.toLocation ?? "—",
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
    ...(actions
      ? [
          {
            id: "actions",
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    disabled={!actions.canWrite}
                    onClick={() => actions.onEdit(row.original)}
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={!actions.canWrite}
                    onClick={() => actions.onDelete(row.original)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          } satisfies ColumnDef<DispatchRow>,
        ]
      : []),
  ];
}
