"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import type { RequisitionRow } from "@/app/actions/requisition/requisitions";
import { DataTable } from "@/components/data-table/data-table";
import { DeleteConfirmDialog } from "@/components/master/delete-confirm-dialog";
import { MasterSectionHeader } from "@/components/master/master-section-header";
import { MasterTableSkeleton } from "@/components/master/master-table-skeleton";
import { createRequisitionColumns } from "@/components/requisition/requisition-columns";
import { RequisitionFormDialog } from "@/components/requisition/requisition-form-dialog";
import {
  useCreateRequisition,
  useDeleteRequisition,
  useRequisitions,
  useUpdateRequisition,
} from "@/hooks/requisition/use-requisitions";
import type { RequisitionFormInput } from "@/lib/schemas/requisition/requisition";

export function RequisitionsSection() {
  const { data = [], isPending, isError, error } = useRequisitions();
  const createMutation = useCreateRequisition();
  const updateMutation = useUpdateRequisition();
  const deleteMutation = useDeleteRequisition();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingRequisition, setEditingRequisition] =
    useState<RequisitionRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingRequisition, setDeletingRequisition] =
    useState<RequisitionRow | null>(null);

  const columns = useMemo<ColumnDef<RequisitionRow>[]>(
    () =>
      createRequisitionColumns({
        onEdit: (row) => {
          setFormMode("edit");
          setEditingRequisition(row);
          setFormOpen(true);
        },
        onDelete: (row) => {
          setDeletingRequisition(row);
          setDeleteOpen(true);
        },
      }),
    [],
  );

  function handleCreateOpen() {
    setFormMode("create");
    setEditingRequisition(null);
    setFormOpen(true);
  }

  function handleFormSubmit(values: RequisitionFormInput) {
    if (formMode === "create") {
      createMutation.mutate(values, {
        onSuccess: () => setFormOpen(false),
      });
      return;
    }

    if (!editingRequisition) return;

    updateMutation.mutate(
      { id: editingRequisition.id, ...values },
      {
        onSuccess: () => {
          setFormOpen(false);
          setEditingRequisition(null);
        },
      },
    );
  }

  function handleDeleteConfirm() {
    if (!deletingRequisition) return;

    deleteMutation.mutate(deletingRequisition.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setDeletingRequisition(null);
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <MasterSectionHeader
        title="Requisitions"
        description="Manage seed requisitions for farmers."
        actionLabel="Add Requisition"
        onAction={handleCreateOpen}
      />

      {isPending ? (
        <MasterTableSkeleton columnCount={8} rowCount={6} />
      ) : isError ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          filterColumn="farmer"
          filterPlaceholder="Search farmers…"
        />
      )}

      <RequisitionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        initialRequisition={editingRequisition}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete requisition"
        description={
          deletingRequisition
            ? `Are you sure you want to delete the requisition for "${deletingRequisition.farmer.name}"? This action cannot be undone.`
            : ""
        }
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
