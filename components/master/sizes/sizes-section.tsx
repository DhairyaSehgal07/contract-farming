"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import type { SizeRow } from "@/app/actions/master/sizes";
import { DataTable } from "@/components/data-table/data-table";
import { DeleteConfirmDialog } from "@/components/master/delete-confirm-dialog";
import { createSizeColumns } from "@/components/master/sizes/size-columns";
import { SizeFormDialog } from "@/components/master/sizes/size-form-dialog";
import { MasterSectionHeader } from "@/components/master/master-section-header";
import { MasterTableSkeleton } from "@/components/master/master-table-skeleton";
import {
  useCreateSize,
  useDeleteSize,
  useSizes,
  useUpdateSize,
} from "@/hooks/master/use-sizes";
import type { SizeFormInput } from "@/lib/schemas/master/size";

export function SizesSection() {
  const { data = [], isPending, isError, error } = useSizes();
  const createMutation = useCreateSize();
  const updateMutation = useUpdateSize();
  const deleteMutation = useDeleteSize();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingRow, setEditingRow] = useState<SizeRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingRow, setDeletingRow] = useState<SizeRow | null>(null);

  const columns = useMemo<ColumnDef<SizeRow>[]>(
    () =>
      createSizeColumns({
        onEdit: (row) => {
          setFormMode("edit");
          setEditingRow(row);
          setFormOpen(true);
        },
        onDelete: (row) => {
          setDeletingRow(row);
          setDeleteOpen(true);
        },
      }),
    [],
  );

  const isFormPending = createMutation.isPending || updateMutation.isPending;

  function handleCreateOpen() {
    setFormMode("create");
    setEditingRow(null);
    setFormOpen(true);
  }

  function handleFormSubmit(values: SizeFormInput) {
    if (formMode === "create") {
      createMutation.mutate(values, {
        onSuccess: () => setFormOpen(false),
      });
      return;
    }

    if (!editingRow) return;

    updateMutation.mutate(
      { id: editingRow.id, ...values },
      {
        onSuccess: () => {
          setFormOpen(false);
          setEditingRow(null);
        },
      },
    );
  }

  function handleDeleteConfirm() {
    if (!deletingRow) return;

    deleteMutation.mutate(deletingRow.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setDeletingRow(null);
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <MasterSectionHeader
        title="Sizes"
        description="Manage bag size reference data and bags-per-acre standards."
        actionLabel="Add Size"
        onAction={handleCreateOpen}
      />

      {isPending ? (
        <MasterTableSkeleton columnCount={3} />
      ) : isError ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          filterColumn="name"
          filterPlaceholder="Search sizes…"
        />
      )}

      <SizeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        initialValues={{
          name: editingRow?.name ?? "",
          bagsPerAcre:
            editingRow?.bagsPerAcre != null
              ? String(editingRow.bagsPerAcre)
              : "",
        }}
        isPending={isFormPending}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete size"
        description={
          deletingRow
            ? `Are you sure you want to delete "${deletingRow.name}"? This action cannot be undone.`
            : ""
        }
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
