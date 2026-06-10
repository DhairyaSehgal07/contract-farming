"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import type { FarmerRow } from "@/app/actions/master/farmers";
import { DataTable } from "@/components/data-table/data-table";
import { DeleteConfirmDialog } from "@/components/master/delete-confirm-dialog";
import { createFarmerColumns } from "@/components/master/farmers/farmer-columns";
import { FarmerFormDialog } from "@/components/master/farmers/farmer-form-dialog";
import { MasterSectionHeader } from "@/components/master/master-section-header";
import { MasterTableSkeleton } from "@/components/master/master-table-skeleton";
import {
  useCreateFarmer,
  useDeleteFarmer,
  useFarmers,
  useUpdateFarmer,
} from "@/hooks/master/use-farmers";
import type { FarmerFormInput } from "@/lib/schemas/master/farmer";

export function FarmersSection() {
  const { data = [], isPending, isError, error } = useFarmers();
  const createMutation = useCreateFarmer();
  const updateMutation = useUpdateFarmer();
  const deleteMutation = useDeleteFarmer();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingFarmer, setEditingFarmer] = useState<FarmerRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingFarmer, setDeletingFarmer] = useState<FarmerRow | null>(null);

  const columns = useMemo<ColumnDef<FarmerRow>[]>(
    () =>
      createFarmerColumns({
        onEdit: (row) => {
          setFormMode("edit");
          setEditingFarmer(row);
          setFormOpen(true);
        },
        onDelete: (row) => {
          setDeletingFarmer(row);
          setDeleteOpen(true);
        },
      }),
    [],
  );

  function handleCreateOpen() {
    setFormMode("create");
    setEditingFarmer(null);
    setFormOpen(true);
  }

  function handleFormSubmit(values: FarmerFormInput) {
    if (formMode === "create") {
      createMutation.mutate(values, {
        onSuccess: () => setFormOpen(false),
      });
      return;
    }

    if (!editingFarmer) return;

    updateMutation.mutate(
      { id: editingFarmer.id, ...values },
      {
        onSuccess: () => {
          setFormOpen(false);
          setEditingFarmer(null);
        },
      },
    );
  }

  function handleDeleteConfirm() {
    if (!deletingFarmer) return;

    deleteMutation.mutate(deletingFarmer.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setDeletingFarmer(null);
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <MasterSectionHeader
        title="Farmers"
        description="Manage farmer records, contact details, and bank information."
        actionLabel="Add Farmer"
        onAction={handleCreateOpen}
      />

      {isPending ? (
        <MasterTableSkeleton columnCount={6} rowCount={6} />
      ) : isError ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          filterColumn="name"
          filterPlaceholder="Search farmers…"
        />
      )}

      <FarmerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        initialFarmer={editingFarmer}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete farmer"
        description={
          deletingFarmer
            ? `Are you sure you want to delete "${deletingFarmer.name}"? This action cannot be undone.`
            : ""
        }
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
