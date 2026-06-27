"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Group, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import type { FarmerRow } from "@/app/actions/master/farmers";
import { DataTable } from "@/components/data-table/data-table";
import { createFarmerColumns } from "@/components/farmers/farmer-columns";
import { FarmerFormDialog } from "@/components/farmers/farmer-form-dialog";
import { DeleteConfirmDialog } from "@/components/master/delete-confirm-dialog";
import { MasterTableSkeleton } from "@/components/master/master-table-skeleton";
import { Button } from "@/components/ui/button";
import {
  useCreateFarmer,
  useDeleteFarmer,
  useFarmers,
  useUpdateFarmer,
} from "@/hooks/farmer/use-farmers";
import type { FarmerFormInput } from "@/lib/schemas/master/farmer";

type FarmersSectionProps = {
  canWriteMaster: boolean;
};

export function FarmersSection({ canWriteMaster }: FarmersSectionProps) {
  const { data = [], isPending, isError, error } = useFarmers();
  const createMutation = useCreateFarmer();
  const updateMutation = useUpdateFarmer();
  const deleteMutation = useDeleteFarmer();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingFarmer, setEditingFarmer] = useState<FarmerRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingFarmer, setDeletingFarmer] = useState<FarmerRow | null>(null);
  const [groupByFamily, setGroupByFamily] = useState(false);

  const columns = useMemo<ColumnDef<FarmerRow>[]>(
    () =>
      createFarmerColumns({
        canWriteMaster,
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
    [canWriteMaster],
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-medium">Farmers</h2>
          <p className="text-muted-foreground">
            View farmer profiles, requisitions, dispatches, and stock.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={groupByFamily ? "default" : "outline"}
            onClick={() => setGroupByFamily((previous) => !previous)}
          >
            <Group />
            Group by family
          </Button>
          {canWriteMaster ? (
            <Button onClick={handleCreateOpen}>
              <Plus />
              Add Farmer
            </Button>
          ) : null}
        </div>
      </div>

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
          grouping={groupByFamily ? ["familyAccount"] : undefined}
        />
      )}

      {canWriteMaster ? (
        <>
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
        </>
      ) : null}
    </div>
  );
}
