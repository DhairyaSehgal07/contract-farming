"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import type { DispatchableRequisitionRow } from "@/app/actions/dispatch/dispatches";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { RequisitionRemarksDisplay } from "@/components/requisition/requisition-remarks-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { parseDateOnly } from "@/lib/date";
import { getFulfillmentPercent } from "@/lib/requisition/quantity";

function formatDate(value: string | null) {
  if (!value) return "—";
  return parseDateOnly(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatValue(value: string | null) {
  if (!value) return "—";
  return value;
}

function fulfillmentPercent(row: DispatchableRequisitionRow) {
  return getFulfillmentPercent(row);
}

type PendingRequisitionColumnActions = {
  canWrite: boolean;
};

export function createPendingRequisitionColumns(
  actions?: PendingRequisitionColumnActions,
): ColumnDef<DispatchableRequisitionRow>[] {
  return [
    {
      id: "farmer",
      accessorFn: (row) =>
        `${row.farmer.name} ${row.farmer.accountNumber} ${row.variety.name}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Farmer" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span>{row.original.farmer.name}</span>
          <span className="text-muted-foreground">
            #{row.original.farmer.accountNumber}
          </span>
        </div>
      ),
    },
    {
      id: "variety",
      accessorFn: (row) => row.variety.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Variety" />
      ),
    },
    {
      accessorKey: "approvedDeliveryDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Approved delivery" />
      ),
      cell: ({ row }) => formatDate(row.original.approvedDeliveryDate),
    },
    {
      accessorKey: "orderBasis",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Basis" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.orderBasis === "acres" ? "Acres" : "Bags"}
        </Badge>
      ),
    },
    {
      accessorKey: "acres",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Acres ordered" />
      ),
      cell: ({ row }) => formatValue(row.original.acres),
    },
    {
      accessorKey: "initialQuantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Bags ordered" />
      ),
      cell: ({ row }) =>
        row.original.orderBasis === "bags"
          ? formatValue(row.original.initialQuantity)
          : "—",
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => (
        <RequisitionRemarksDisplay remarks={row.original.remarks} />
      ),
    },
    {
      accessorKey: "fulfilledQuantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Dispatched" />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.orderBasis === "acres" ? (
            <>
              {formatValue(row.original.fulfilledAcres)}
              <span className="text-muted-foreground"> acres</span>
              <span className="text-muted-foreground">
                {" "}
                · {formatValue(row.original.fulfilledQuantity)} bags
              </span>
            </>
          ) : (
            <>
              {formatValue(row.original.fulfilledQuantity)}
              <span className="text-muted-foreground"> bags</span>
            </>
          )}
        </span>
      ),
    },
    {
      accessorKey: "remainingQuantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Remaining" />
      ),
      cell: ({ row }) =>
        row.original.remainingQuantity ? (
          <Badge variant="secondary">
            {row.original.remainingQuantity}{" "}
            {row.original.orderBasis === "acres" ? "acres" : "bags"}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "fulfillment",
      accessorFn: (row) => fulfillmentPercent(row),
      header: "Fulfillment",
      cell: ({ row }) => {
        const percent = fulfillmentPercent(row.original);
        const isPartial = percent > 0 && percent < 100;

        return (
          <div className="flex min-w-28 flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{percent}%</span>
              {isPartial ? <span>Partial</span> : null}
            </div>
            <Progress value={percent} />
          </div>
        );
      },
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
                  <DropdownMenuItem asChild>
                    <Link href={`/requisition/${row.original.id}`}>
                      View requisition
                    </Link>
                  </DropdownMenuItem>
                  {actions.canWrite ? (
                    <DropdownMenuItem asChild>
                      <Link href="/dispatch/new">
                        <ArrowUpRight />
                        Create dispatch
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          } satisfies ColumnDef<DispatchableRequisitionRow>,
        ]
      : []),
  ];
}
