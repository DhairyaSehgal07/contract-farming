"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
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
import type { FamilyTableRow } from "@/lib/master/flatten-family-rows";

type FamilyColumnActions = {
  onEdit: (row: FamilyTableRow) => void;
  onDelete: (row: FamilyTableRow) => void;
};

export function createFamilyColumns(
  actions: FamilyColumnActions,
): ColumnDef<FamilyTableRow>[] {
  return [
    {
      accessorKey: "accountNumber",
      enableSorting: false,
      meta: { enableRowSpan: true },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account number" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/farmer-family/${row.original.familyId}`}
          className="font-medium hover:underline"
        >
          #{row.original.accountNumber}
        </Link>
      ),
    },
    {
      accessorKey: "name",
      enableSorting: false,
      meta: { enableRowSpan: true },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/farmer-family/${row.original.familyId}`}
          className="hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      id: "station",
      accessorFn: (row) => row.station.name,
      enableSorting: false,
      meta: { enableRowSpan: true },
      header: "Station",
    },
    {
      id: "locality",
      accessorFn: (row) => row.locality.name,
      enableSorting: false,
      meta: { enableRowSpan: true },
      header: "Locality",
    },
    {
      accessorKey: "memberCount",
      enableSorting: false,
      meta: { enableRowSpan: true },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Members" />
      ),
      cell: ({ row }) => row.original.memberCount,
    },
    {
      accessorKey: "memberName",
      enableSorting: false,
      header: "Member name",
      cell: ({ row }) => row.original.memberName ?? "—",
    },
    {
      accessorKey: "memberAccountNumber",
      enableSorting: false,
      header: "Member account",
      cell: ({ row }) =>
        row.original.memberAccountNumber
          ? `#${row.original.memberAccountNumber}`
          : "—",
    },
    {
      id: "actions",
      enableSorting: false,
      meta: { enableRowSpan: true },
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
            <DropdownMenuItem onClick={() => actions.onEdit(row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => actions.onDelete(row.original)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
