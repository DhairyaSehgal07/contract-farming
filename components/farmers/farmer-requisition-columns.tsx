"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import type { RequisitionRow } from "@/app/actions/requisition/requisitions";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { RequisitionRemarksDisplay } from "@/components/requisition/requisition-remarks-display";
import { RequisitionStatusBadge } from "@/components/requisition/requisition-status-badge";
import { parseDateOnly } from "@/lib/date";

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

export function createFarmerRequisitionColumns(): ColumnDef<RequisitionRow>[] {
  return [
    {
      accessorKey: "requisitionDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Requisition date" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/requisition/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {formatDate(row.original.requisitionDate)}
        </Link>
      ),
    },
    {
      accessorKey: "requestedDeliveryDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Requested delivery" />
      ),
      cell: ({ row }) => formatDate(row.original.requestedDeliveryDate),
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
      header: "Bags",
      cell: ({ row }) => formatDecimal(row.original.initialQuantity),
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => (
        <RequisitionRemarksDisplay remarks={row.original.remarks} />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <RequisitionStatusBadge
          status={row.original.status}
          reviewedByName={row.original.reviewedBy?.name}
          approvalDate={row.original.approvalDate}
          rejectionRemarks={row.original.rejectionRemarks}
        />
      ),
    },
    {
      accessorKey: "approvedDeliveryDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Approved delivery" />
      ),
      cell: ({ row }) =>
        row.original.approvedDeliveryDate
          ? formatDate(row.original.approvedDeliveryDate)
          : "—",
    },
  ];
}
