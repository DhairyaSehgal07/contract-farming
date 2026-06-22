"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import type { DispatchRow } from "@/app/actions/dispatch/dispatches";
import { DataTable } from "@/components/data-table/data-table";
import { createDispatchColumns } from "@/components/dispatch/dispatch-columns";
import { DispatchEditSheet } from "@/components/dispatch/dispatch-edit-sheet";
import { PendingRequisitionsPanel } from "@/components/dispatch/pending-requisitions-panel";
import { DeleteConfirmDialog } from "@/components/master/delete-confirm-dialog";
import { MasterSectionHeader } from "@/components/master/master-section-header";
import { MasterTableSkeleton } from "@/components/master/master-table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDeleteDispatch,
  useDispatchableRequisitions,
  useDispatches,
  useUpdateDispatchStep2,
} from "@/hooks/dispatch/use-dispatches";
import type { DispatchStep2Input } from "@/lib/schemas/dispatch/dispatch";

type DispatchesSectionProps = {
  canWrite: boolean;
};

export function DispatchesSection({ canWrite }: DispatchesSectionProps) {
  const { data = [], isPending, isError, error } = useDispatches();
  const { data: pendingRequisitions = [] } = useDispatchableRequisitions();
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

      <Tabs defaultValue="dispatches">
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value="dispatches">Dispatches</TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            Pending requisitions
            {pendingRequisitions.length > 0 ? (
              <Badge variant="secondary">{pendingRequisitions.length}</Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dispatches" className="mt-6">
          {isPending ? (
            <MasterTableSkeleton columnCount={10} rowCount={6} />
          ) : isError ? (
            <p className="text-sm text-destructive">{error.message}</p>
          ) : (
            <DataTable
              columns={columns}
              data={data}
              filterColumn="truckNumber"
              filterPlaceholder="Search truck numbers…"
            />
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <PendingRequisitionsPanel canWrite={canWrite} />
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
