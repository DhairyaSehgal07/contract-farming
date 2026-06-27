"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import type { FarmerFieldRow } from "@/app/actions/farmer/farmer-fields";
import { DataTable } from "@/components/data-table/data-table";
import { createFarmerFieldColumns } from "@/components/farmers/farmer-field-columns";
import { FarmerFieldFormDialog } from "@/components/farmers/farmer-field-form-dialog";
import { DeleteConfirmDialog } from "@/components/master/delete-confirm-dialog";
import { MasterTableSkeleton } from "@/components/master/master-table-skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useCreateFarmerField,
  useDeleteFarmerField,
  useFarmerFields,
  useUpdateFarmerField,
} from "@/hooks/farmer/use-farmer-fields";
import type { FarmerFieldFormInput } from "@/lib/schemas/farmer/farmer-field";

type FarmerFieldsSectionProps = {
  farmerId: string;
  canWriteMaster: boolean;
};

export function FarmerFieldsSection({
  farmerId,
  canWriteMaster,
}: FarmerFieldsSectionProps) {
  const { data = [], isPending, isError, error } = useFarmerFields(farmerId);
  const createMutation = useCreateFarmerField(farmerId);
  const updateMutation = useUpdateFarmerField(farmerId);
  const deleteMutation = useDeleteFarmerField(farmerId);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingField, setEditingField] = useState<FarmerFieldRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingField, setDeletingField] = useState<FarmerFieldRow | null>(
    null,
  );

  const columns = useMemo<ColumnDef<FarmerFieldRow>[]>(
    () =>
      createFarmerFieldColumns({
        canWriteMaster,
        onEdit: (row) => {
          setFormMode("edit");
          setEditingField(row);
          setFormOpen(true);
        },
        onDelete: (row) => {
          setDeletingField(row);
          setDeleteOpen(true);
        },
      }),
    [canWriteMaster],
  );

  function handleCreateOpen() {
    setFormMode("create");
    setEditingField(null);
    setFormOpen(true);
  }

  function handleFormSubmit(values: FarmerFieldFormInput) {
    if (formMode === "create") {
      createMutation.mutate(values, {
        onSuccess: () => setFormOpen(false),
      });
      return;
    }

    if (!editingField) return;

    updateMutation.mutate(
      { id: editingField.id, ...values },
      {
        onSuccess: () => {
          setFormOpen(false);
          setEditingField(null);
        },
      },
    );
  }

  function handleDeleteConfirm() {
    if (!deletingField) return;

    deleteMutation.mutate(deletingField.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setDeletingField(null);
      },
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Fields</CardTitle>
          <CardDescription>
            Land parcels registered for this farmer. Open a field to track
            plantation, irrigation, and lifecycle activities.
          </CardDescription>
        </div>
        {canWriteMaster ? (
          <Button onClick={handleCreateOpen}>
            <Plus />
            Add field
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {isPending ? (
          <MasterTableSkeleton columnCount={4} rowCount={4} />
        ) : isError ? (
          <p className="text-sm text-destructive">{error.message}</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No fields recorded for this farmer yet.
          </p>
        ) : (
          <DataTable
            columns={columns}
            data={data}
            filterColumn="name"
            filterPlaceholder="Search fields…"
          />
        )}
      </CardContent>

      {canWriteMaster ? (
        <>
          <FarmerFieldFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            mode={formMode}
            initialField={editingField}
            isPending={createMutation.isPending || updateMutation.isPending}
            onSubmit={handleFormSubmit}
          />

          <DeleteConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Delete field"
            description={
              deletingField
                ? `Are you sure you want to delete "${deletingField.name}"? This action cannot be undone.`
                : ""
            }
            onConfirm={handleDeleteConfirm}
            isPending={deleteMutation.isPending}
          />
        </>
      ) : null}
    </Card>
  );
}
