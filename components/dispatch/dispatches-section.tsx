"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ClipboardList, PackageCheck, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import type { DispatchRow } from "@/app/actions/dispatch/dispatches";
import { DataTable } from "@/components/data-table/data-table";
import { createDispatchColumns } from "@/components/dispatch/dispatch-columns";
import { DispatchEditSheet } from "@/components/dispatch/dispatch-edit-sheet";
import { PendingRequisitionsPanel } from "@/components/dispatch/pending-requisitions-panel";
import { DeleteConfirmDialog } from "@/components/master/delete-confirm-dialog";
import { MasterSectionHeader } from "@/components/master/master-section-header";
import { MasterTableSkeleton } from "@/components/master/master-table-skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDeleteDispatch,
  useDispatches,
  useUpdateDispatchStep2,
} from "@/hooks/dispatch/use-dispatches";
import { getDispatchesSummary } from "@/lib/dispatch/summary";
import type { DispatchStep2Input } from "@/lib/schemas/dispatch/dispatch";

type DispatchesSectionProps = {
  canWrite: boolean;
};

export function DispatchesSection({ canWrite }: DispatchesSectionProps) {
  const { data = [], isPending, isError, error } = useDispatches();
  const [activeTab, setActiveTab] = useState("dispatches");
  const updateMutation = useUpdateDispatchStep2();
  const deleteMutation = useDeleteDispatch();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingDispatch, setEditingDispatch] = useState<DispatchRow | null>(null);
  const [deletingDispatch, setDeletingDispatch] = useState<DispatchRow | null>(null);

  const columns = useMemo<ColumnDef<DispatchRow>[]>(
    () =>
      createDispatchColumns({
        canWrite,
        onEdit: (row) => {
          setEditingDispatch(row);
          setEditOpen(true);
        },
        onDelete: (row) => {
          setDeletingDispatch(row);
          setDeleteOpen(true);
        },
      }),
    [canWrite],
  );

  const summary = useMemo(() => getDispatchesSummary(data), [data]);

  function handleEditSubmit(values: DispatchStep2Input) {
    if (!editingDispatch) return;

    updateMutation.mutate(
      { id: editingDispatch.id, ...values },
      {
        onSuccess: () => {
          setEditOpen(false);
          setEditingDispatch(null);
        },
      },
    );
  }

  function handleDeleteConfirm() {
    if (!deletingDispatch) return;

    deleteMutation.mutate(deletingDispatch.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setDeletingDispatch(null);
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <MasterSectionHeader
        title="Dispatch"
        description="Manage seed dispatches and track requisitions awaiting fulfillment."
        actionLabel="Add Dispatch"
        actionHref={canWrite ? "/dispatch/new" : undefined}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value="dispatches">Dispatched</TabsTrigger>
          <TabsTrigger value="pending">Pending dispatches</TabsTrigger>
        </TabsList>

        <TabsContent value="dispatches" className="mt-6">
          {isPending ? (
            <MasterTableSkeleton columnCount={10} rowCount={6} />
          ) : isError ? (
            <p className="text-sm text-destructive">{error.message}</p>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Card size="sm">
                  <CardHeader>
                    <CardDescription>Total dispatches</CardDescription>
                    <CardTitle>{summary.total}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Truck className="size-4" />
                      <span>
                        {summary.openCount} open · {summary.closedCount}{" "}
                        closed
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card size="sm">
                  <CardHeader>
                    <CardDescription>Lots awaiting receipt</CardDescription>
                    <CardTitle>{summary.lotsPendingReceipt}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <PackageCheck className="size-4" />
                      <span>
                        {summary.openWithPendingLots === 0
                          ? "All lots received on open dispatches"
                          : `Across ${summary.openWithPendingLots} open dispatch${
                              summary.openWithPendingLots === 1 ? "" : "es"
                            }`}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card size="sm">
                  <CardHeader>
                    <CardDescription>Open dispatches</CardDescription>
                    <CardTitle>{summary.openCount}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ClipboardList className="size-4" />
                      <span>
                        {summary.openCount === 0
                          ? "No open dispatches"
                          : `${summary.lotsPendingReceipt} lot${
                              summary.lotsPendingReceipt === 1 ? "" : "s"
                            } still pending receipt`}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DataTable
                columns={columns}
                data={data}
                filterColumn="truckNumber"
                filterPlaceholder="Search truck numbers…"
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <PendingRequisitionsPanel canWrite={canWrite} enabled={activeTab === "pending"} />
        </TabsContent>
      </Tabs>

      <DispatchEditSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        dispatch={editingDispatch}
        isPending={updateMutation.isPending}
        onSubmit={handleEditSubmit}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete dispatch"
        description={
          deletingDispatch
            ? `Delete dispatch "${deletingDispatch.truckNumber ?? deletingDispatch.id}"? This will reverse requisition fulfilled quantities for this entry.`
            : ""
        }
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
