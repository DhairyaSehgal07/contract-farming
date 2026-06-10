"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DeleteConfirmDialog } from "@/components/master/delete-confirm-dialog";
import { createLookupColumns } from "@/components/master/lookup/lookup-columns";
import { LookupFormDialog } from "@/components/master/lookup/lookup-form-dialog";
import type {
  LookupConfig,
  LookupRow,
} from "@/components/master/lookup/lookup-types";
import { MasterSectionHeader } from "@/components/master/master-section-header";
import { MasterTableSkeleton } from "@/components/master/master-table-skeleton";
import {
  useCreateLookup,
  useDeleteLookup,
  useLookupList,
  useUpdateLookup,
} from "@/hooks/master/use-lookup";

type LookupSectionProps = {
  config: LookupConfig;
};

export function LookupSection({ config }: LookupSectionProps) {
  const { data = [], isPending, isError, error } = useLookupList(config);
  const createMutation = useCreateLookup(config);
  const updateMutation = useUpdateLookup(config);
  const deleteMutation = useDeleteLookup(config);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingRow, setEditingRow] = useState<LookupRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingRow, setDeletingRow] = useState<LookupRow | null>(null);

  const columns = useMemo<ColumnDef<LookupRow>[]>(
    () =>
      createLookupColumns({
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

  function handleFormSubmit(values: { name: string }) {
    if (formMode === "create") {
      createMutation.mutate(values, {
        onSuccess: () => setFormOpen(false),
      });
      return;
    }

    if (!editingRow) return;

    updateMutation.mutate(
      { id: editingRow.id, name: values.name },
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
        title={config.title}
        description={config.description}
        actionLabel={config.actionLabel}
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
          filterPlaceholder={`Search ${config.title.toLowerCase()}…`}
        />
      )}

      <LookupFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        initialName={editingRow?.name ?? ""}
        isPending={isFormPending}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${config.singularLabel}`}
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
