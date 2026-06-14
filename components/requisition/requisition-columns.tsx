"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import type { RequisitionRow } from "@/app/actions/requisition/requisitions";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
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

function statusVariant(
  status: RequisitionRow["status"],
): "default" | "destructive" | "outline" {
  switch (status) {
    case "APPROVED":
      return "default";
    case "REJECTED":
      return "destructive";
    default:
      return "outline";
  }
}

function statusLabel(status: RequisitionRow["status"]) {
  switch (status) {
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    default:
      return "Pending";
  }
}

function RequisitionStatusBadge({ status }: { status: RequisitionRow["status"] }) {
  return (
    <Badge variant={statusVariant(status)}>{statusLabel(status)}</Badge>
  );
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
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => formatDecimal(row.original.quantity),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <RequisitionStatusBadge status={row.original.status} />
      ),
    },
    {
      id: "createdBy",
      accessorFn: (row) => row.createdBy.name,
      header: "Created by",
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
