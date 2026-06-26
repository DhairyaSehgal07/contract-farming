"use client";

import { useMemo } from "react";
import { LandPlot, PackageOpen, Truck } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { createPendingRequisitionColumns } from "@/components/dispatch/pending-requisition-columns";
import { MasterTableSkeleton } from "@/components/master/master-table-skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDispatchableRequisitions } from "@/hooks/dispatch/use-dispatches";
import {
  formatAcresPendingSummary,
  getPendingRequisitionsSummary,
} from "@/lib/requisition/quantity";

type PendingRequisitionsPanelProps = {
  canWrite: boolean;
  enabled?: boolean;
};

export function PendingRequisitionsPanel({
  canWrite,
  enabled = true,
}: PendingRequisitionsPanelProps) {
  const {
    data: requisitions = [],
    isPending,
    isError,
    error,
  } = useDispatchableRequisitions({ enabled });

  const columns = useMemo(
    () => createPendingRequisitionColumns({ canWrite }),
    [canWrite],
  );

  const summary = useMemo(
    () => getPendingRequisitionsSummary(requisitions),
    [requisitions],
  );

  if (isPending) {
    return <MasterTableSkeleton columnCount={11} rowCount={6} />;
  }

  if (isError) {
    return <p className="text-sm text-destructive">{error.message}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Approved, awaiting dispatch</CardDescription>
            <CardTitle>{requisitions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <PackageOpen className="size-4" />
              <span>
                {summary.bagsBasedCount} by bags · {summary.acresBasedCount} by
                acres
              </span>
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardDescription>Bags still to dispatch</CardDescription>
            <CardTitle>{summary.bagsRemaining}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="size-4" />
              <span>
                {summary.bagsBasedCount === 0
                  ? "No bag-based requisitions pending"
                  : `Across ${summary.bagsBasedCount} bag-based requisition${
                      summary.bagsBasedCount === 1 ? "" : "s"
                    }`}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardDescription>Acres awaiting dispatch</CardDescription>
            <CardTitle>
              {summary.acresBasedCount > 0
                ? formatAcresPendingSummary(summary.acresPending)
                : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LandPlot className="size-4" />
              <span>
                {summary.acresBasedCount === 0
                  ? "No acre-based requisitions pending"
                  : `Across ${summary.acresBasedCount} acre-based requisition${
                      summary.acresBasedCount === 1 ? "" : "s"
                    }`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {requisitions.length === 0 ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle>All caught up</CardTitle>
            <CardDescription>
              Every approved requisition has been fully dispatched.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          {canWrite ? (
            <div className="flex justify-end">
              <Button asChild>
                <Link href="/dispatch/new">Dispatch pending requisitions</Link>
              </Button>
            </div>
          ) : null}

          <DataTable
            columns={columns}
            data={requisitions}
            filterColumn="farmer"
            filterPlaceholder="Search farmers or varieties…"
          />
        </>
      )}
    </div>
  );
}
