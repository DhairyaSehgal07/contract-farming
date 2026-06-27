"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import type { FarmerFamilyRow } from "@/app/actions/master/farmer-families";
import {
  FamiliesDataTable,
  useFlattenedFamilyRows,
} from "@/components/master/families/families-data-table";
import { createFamilyColumns } from "@/components/master/families/family-columns";
import { FamilyFormDialog } from "@/components/master/families/family-form-dialog";
import { DeleteConfirmDialog } from "@/components/master/delete-confirm-dialog";
import { MasterSectionHeader } from "@/components/master/master-section-header";
import { MasterTableSkeleton } from "@/components/master/master-table-skeleton";
import {
  useCreateFarmerFamily,
  useDeleteFarmerFamily,
  useFarmerFamilyRecords,
  useUpdateFarmerFamily,
} from "@/hooks/master/use-farmer-family-records";
import type { FamilyTableRow } from "@/lib/master/flatten-family-rows";
import type { FarmerFamilyFormInput } from "@/lib/schemas/master/farmer-family-form";

export function FamiliesSection() {
  const { data = [], isPending, isError, error } = useFarmerFamilyRecords();
  const flattenedRows = useFlattenedFamilyRows(data);
  const createMutation = useCreateFarmerFamily();
  const updateMutation = useUpdateFarmerFamily();
  const deleteMutation = useDeleteFarmerFamily();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingFamily, setEditingFamily] = useState<FarmerFamilyRow | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingFamily, setDeletingFamily] = useState<FarmerFamilyRow | null>(
    null,
  );

  const columns = useMemo<ColumnDef<FamilyTableRow>[]>(
    () =>
      createFamilyColumns({
        onEdit: (row) => {
          setFormMode("edit");
          setEditingFamily(row.family);
          setFormOpen(true);
        },
        onDelete: (row) => {
          setDeletingFamily(row.family);
          setDeleteOpen(true);
        },
      }),
    [],
  );

  function handleCreateOpen() {
    setFormMode("create");
    setEditingFamily(null);
    setFormOpen(true);
  }

  function handleFormSubmit(values: FarmerFamilyFormInput) {
    if (formMode === "create") {
      createMutation.mutate(values, {
        onSuccess: () => setFormOpen(false),
      });
      return;
    }

    if (!editingFamily) return;

    updateMutation.mutate(
      { id: editingFamily.id, ...values },
      {
        onSuccess: () => {
          setFormOpen(false);
          setEditingFamily(null);
        },
      },
    );
  }

  function handleDeleteConfirm() {
    if (!deletingFamily) return;

    deleteMutation.mutate(deletingFamily.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setDeletingFamily(null);
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <MasterSectionHeader
        title="Families"
        description="Manage farmer family groups. Link individual farmers as members from the Farmers tab."
        actionLabel="Add family"
        onAction={handleCreateOpen}
      />

      {isPending ? (
        <MasterTableSkeleton columnCount={8} rowCount={6} />
      ) : isError ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : (
        <FamiliesDataTable
          columns={columns}
          data={flattenedRows}
          filterPlaceholder="Search families…"
        />
      )}

      <FamilyFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        initialFamily={editingFamily}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete family"
        description={
          deletingFamily
            ? deletingFamily._count.members > 0
              ? `"${deletingFamily.name}" has ${deletingFamily._count.members} linked member(s). Remove or reassign members before deleting this family.`
              : `Are you sure you want to delete "${deletingFamily.name}"? This action cannot be undone.`
            : ""
        }
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
        confirmDisabled={Boolean(deletingFamily && deletingFamily._count.members > 0)}
      />
    </div>
  );
}
