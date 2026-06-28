"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

type FamilyMemberRow = {
  id: string;
  name: string;
  accountNumber: string;
};

export function createFamilyMemberColumns(): ColumnDef<FamilyMemberRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/farmers/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "accountNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account number" />
      ),
      cell: ({ row }) => `#${row.original.accountNumber}`,
    },
  ];
}
