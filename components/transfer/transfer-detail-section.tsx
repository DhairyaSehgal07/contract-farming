"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStockTransfer } from "@/hooks/transfer/use-stock-transfers";
import { parseDateOnly } from "@/lib/date";
import type { ColumnDef } from "@tanstack/react-table";
import type { StockTransferDetail } from "@/app/actions/transfer/stock-transfers";

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

const lineColumns: ColumnDef<StockTransferDetail["lines"][number]>[] = [
  {
    id: "variety",
    accessorFn: (row) => row.variety.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Variety" />
    ),
    cell: ({ row }) => row.original.variety.name,
  },
  {
    id: "size",
    accessorFn: (row) => row.size.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Size" />
    ),
    cell: ({ row }) => row.original.size.name,
  },
  {
    id: "generation",
    accessorFn: (row) => row.generation.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Generation" />
    ),
    cell: ({ row }) => row.original.generation.name,
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quantity" />
    ),
    cell: ({ row }) => row.original.quantity,
  },
];

type TransferDetailSectionProps = {
  id: string;
};

export function TransferDetailSection({ id }: TransferDetailSectionProps) {
  const { data, isPending, isError, error } = useStockTransfer(id);

  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-sm text-destructive">{error?.message}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/transfer">
            <ArrowLeft />
            <span className="sr-only">Back to transfers</span>
          </Link>
        </Button>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Transfer {formatDate(data.transferDate)}
          </h1>
          <p className="text-muted-foreground text-sm">
            {formatFarmer(data.fromFarmer)} → {formatFarmer(data.toFarmer)}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer summary</CardTitle>
          <CardDescription>
            {data.totalQuantity} bags transferred
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-0.5">
              <dt className="text-muted-foreground">From farmer</dt>
              <dd>{formatFarmer(data.fromFarmer)}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-muted-foreground">To farmer</dt>
              <dd>{formatFarmer(data.toFarmer)}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-muted-foreground">Created by</dt>
              <dd>{data.createdBy.name}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-muted-foreground">Remarks</dt>
              <dd>{data.remarks ?? "—"}</dd>
            </div>
          </dl>

          <DataTable
            columns={lineColumns}
            data={data.lines}
            showPagination={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
