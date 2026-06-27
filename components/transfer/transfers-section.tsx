"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeftRight } from "lucide-react";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { MasterSectionHeader } from "@/components/master/master-section-header";
import { MasterTableSkeleton } from "@/components/master/master-table-skeleton";
import { createTransferColumns } from "@/components/transfer/transfer-columns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStockTransfers } from "@/hooks/transfer/use-stock-transfers";
import { getTransfersSummary } from "@/lib/transfer/summary";

type TransfersSectionProps = {
  canWrite: boolean;
};

export function TransfersSection({ canWrite }: TransfersSectionProps) {
  const { data = [], isPending, isError, error } = useStockTransfers();

  const columns = useMemo<ColumnDef<typeof data[number]>[]>(
    () => createTransferColumns(),
    [],
  );

  const summary = useMemo(() => getTransfersSummary(data), [data]);

  return (
    <div className="flex flex-col gap-6">
      <MasterSectionHeader
        title="Transfer"
        description="Move received seed bags between farmers when stock needs to be reallocated."
        actionLabel="New transfer"
        actionHref={canWrite ? "/transfer/new" : undefined}
      />

      {isPending ? (
        <MasterTableSkeleton columnCount={5} rowCount={6} />
      ) : isError ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card size="sm">
              <CardHeader>
                <CardDescription>Total transfers</CardDescription>
                <CardTitle>{summary.total}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowLeftRight className="size-4" />
                  <span>Recorded farmer-to-farmer transfers</span>
                </div>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader>
                <CardDescription>Bags moved</CardDescription>
                <CardTitle>{summary.totalBags}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowLeftRight className="size-4" />
                  <span>Total bags transferred across all records</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <DataTable
            columns={columns}
            data={data}
            filterColumn="fromFarmer"
            filterPlaceholder="Search farmers…"
          />
        </div>
      )}
    </div>
  );
}
