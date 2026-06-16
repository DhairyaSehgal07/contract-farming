"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import type { LocationRow } from "@/app/actions/master/locations";
import { DataTable } from "@/components/data-table/data-table";
import { DeleteConfirmDialog } from "@/components/master/delete-confirm-dialog";
import { createLocationColumns } from "@/components/master/locations/location-columns";
import { LocationFormDialog } from "@/components/master/locations/location-form-dialog";
import { MasterSectionHeader } from "@/components/master/master-section-header";
import { MasterTableSkeleton } from "@/components/master/master-table-skeleton";
import {
  useCreateLocation,
  useDeleteLocation,
  useLocations,
  useUpdateLocation,
} from "@/hooks/master/use-locations";

export function LocationsSection() {
  const { data = [], isPending, isError, error } = useLocations();
  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useDeleteLocation();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingRow, setEditingRow] = useState<LocationRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingRow, setDeletingRow] = useState<LocationRow | null>(null);

  const columns = useMemo<ColumnDef<LocationRow>[]>(
    () =>
      createLocationColumns({
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

  function handleFormSubmit(values: { name: string; category: string }) {
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
        title="Locations"
        description="Manage location reference data."
        actionLabel="Add Location"
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
          filterPlaceholder="Search locations…"
        />
      )}

      <LocationFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        initialValues={{
          name: editingRow?.name ?? "",
          category: editingRow?.category ?? "",
        }}
        isPending={isFormPending}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete location"
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
