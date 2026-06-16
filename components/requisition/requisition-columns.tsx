"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import type { RequisitionRow } from "@/app/actions/requisition/requisitions";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { RequisitionStatusBadge } from "@/components/requisition/requisition-status-badge";
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

type RequisitionColumnActions = {
  canApprove: boolean;
  onEdit: (row: RequisitionRow) => void;
  onDelete: (row: RequisitionRow) => void;
  onApprove: (row: RequisitionRow) => void;
  onReject: (row: RequisitionRow) => void;
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: string) {
  return parseDateOnly(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDecimal(value: string | null) {
  return value ?? "—";
}

export function createRequisitionColumns(
  actions: RequisitionColumnActions,
): ColumnDef<RequisitionRow>[] {
  return [
    {
      accessorKey: "requisitionDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Requisition date" />
      ),
      cell: ({ row }) => formatDate(row.original.requisitionDate),
    },
    {
      accessorKey: "expectedDeliveryDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Expected delivery" />
      ),
      cell: ({ row }) => formatDate(row.original.expectedDeliveryDate),
    },
    {
      id: "farmer",
      accessorFn: (row) => row.farmer.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Farmer" />
      ),
    },
    {
      id: "variety",
      accessorFn: (row) => row.variety.name,
      header: "Variety",
    },
    {
      accessorKey: "acres",
      header: "Acres",
      cell: ({ row }) => formatDecimal(row.original.acres),
    },
    {
      accessorKey: "initialQuantity",
      header: "Quantity",
      cell: ({ row }) => formatDecimal(row.original.initialQuantity),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <RequisitionStatusBadge status={row.original.status} />
      ),
    },
    {
      accessorKey: "approvalDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Approval date" />
      ),
      cell: ({ row }) =>
        row.original.approvalDate
          ? formatDate(row.original.approvalDate)
          : "—",
    },
    {
      accessorKey: "rejectionDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rejection date" />
      ),
      cell: ({ row }) =>
        row.original.rejectionDate
          ? formatDate(row.original.rejectionDate)
          : "—",
    },
    {
      id: "createdBy",
      accessorFn: (row) => row.createdBy.name,
      header: "Created by",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created at" />
      ),
      cell: ({ row }) =>
        dateTimeFormatter.format(new Date(row.original.createdAt)),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const isPending = row.original.status === "PENDING";
        const showApprovalActions = actions.canApprove && isPending;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/requisition/${row.original.id}`}>View</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {showApprovalActions ? (
                <>
                  <DropdownMenuItem
                    onClick={() => actions.onApprove(row.original)}
                  >
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => actions.onReject(row.original)}
                  >
                    Reject
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              ) : null}
              <DropdownMenuItem
                disabled={!isPending}
                onClick={() => actions.onEdit(row.original)}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                disabled={!isPending}
                onClick={() => actions.onDelete(row.original)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
