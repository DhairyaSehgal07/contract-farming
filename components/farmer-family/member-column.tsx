"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import type { RequisitionRow } from "@/app/actions/requisition/requisitions";

type MemberRef = {
  farmerId: string;
  farmer: { id: string; name: string; accountNumber: string };
};

export function createMemberColumn<
  T extends MemberRef,
>(): ColumnDef<T> {
  return {
    id: "member",
    accessorFn: (row) => row.farmer.name,
    header: "Member",
    cell: ({ row }) => (
      <Link
        href={`/farmers/${row.original.farmerId}`}
        className="font-medium hover:underline"
      >
        {row.original.farmer.name}
        <span className="text-muted-foreground">
          {" "}
          (#{row.original.farmer.accountNumber})
        </span>
      </Link>
    ),
  };
}

export function createRequisitionMemberColumn(): ColumnDef<RequisitionRow> {
  return {
    id: "member",
    accessorFn: (row) => row.farmer.name,
    header: "Member",
    cell: ({ row }) => (
      <Link
        href={`/farmers/${row.original.farmerId}`}
        className="font-medium hover:underline"
      >
        {row.original.farmer.name}
        <span className="text-muted-foreground">
          {" "}
          (#{row.original.farmer.accountNumber})
        </span>
      </Link>
    ),
  };
}
