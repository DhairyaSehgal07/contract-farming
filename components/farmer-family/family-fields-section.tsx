"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import type { FamilyFieldRow } from "@/app/actions/farmer/farmer-family-profile";
import type { FarmerFamilyProfileRow } from "@/app/actions/farmer/farmer-family-profile";
import { DataTable } from "@/components/data-table/data-table";
import { createFamilyFieldColumns } from "@/components/farmer-family/family-field-columns";
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
  useCreateFamilyField,
  useDeleteFamilyField,
  useUpdateFamilyField,
} from "@/hooks/farmer/use-family-fields";
import { useFamilyFields } from "@/hooks/farmer/use-farmer-family-profile";
import type { FarmerFieldFormInput } from "@/lib/schemas/farmer/farmer-field";

type FamilyFieldsSectionProps = {
  familyId: string;
  members: FarmerFamilyProfileRow["members"];
  canWriteMaster: boolean;
};

export function FamilyFieldsSection({
  familyId,
  members,
  canWriteMaster,
}: FamilyFieldsSectionProps) {
  const { data = [], isPending, isError, error } = useFamilyFields(familyId);
  const createMutation = useCreateFamilyField(familyId);
  const updateMutation = useUpdateFamilyField(familyId);
  const deleteMutation = useDeleteFamilyField(familyId);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingField, setEditingField] = useState<FamilyFieldRow | null>(null);
  const [selectedFarmerId, setSelectedFarmerId] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingField, setDeletingField] = useState<FamilyFieldRow | null>(
    null,
  );

  const columns = useMemo<ColumnDef<FamilyFieldRow>[]>(
    () =>
      createFamilyFieldColumns({
        canWriteMaster,
        onEdit: (row) => {
          setFormMode("edit");
          setEditingField(row);
          setSelectedFarmerId(row.farmerId);
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
    setSelectedFarmerId(members[0]?.id ?? "");
    setFormOpen(true);
  }

  function handleFormSubmit(values: FarmerFieldFormInput) {
    if (formMode === "create") {
      if (!selectedFarmerId) return;

      createMutation.mutate(
        { ...values, farmerId: selectedFarmerId },
        {
          onSuccess: () => setFormOpen(false),
        },
      );
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

    deleteMutation.mutate(
      { id: deletingField.id, farmerId: deletingField.farmerId },
      {
        onSuccess: () => {
          setDeleteOpen(false);
          setDeletingField(null);
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Fields</CardTitle>
          <CardDescription>
            Land parcels across all family members. Open a field to track
            plantation, irrigation, and lifecycle activities.
          </CardDescription>
        </div>
        {canWriteMaster && members.length > 0 ? (
          <Button onClick={handleCreateOpen}>
            <Plus />
            Add field
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {isPending ? (
          <MasterTableSkeleton columnCount={5} rowCount={4} />
        ) : isError ? (
          <p className="text-sm text-destructive">{error.message}</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No fields recorded for this family yet.
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

      {canWriteMaster && members.length > 0 ? (
        <>
          <FarmerFieldFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            mode={formMode}
            initialField={editingField}
            isPending={createMutation.isPending || updateMutation.isPending}
            onSubmit={handleFormSubmit}
            members={members}
            selectedFarmerId={selectedFarmerId}
            onFarmerIdChange={setSelectedFarmerId}
            memberReadOnly={formMode === "edit"}
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
