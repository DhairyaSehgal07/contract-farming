"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import type {
  FieldDetail,
  FieldInspectionRow,
  FieldIrrigationRow,
  FieldPlantationRow,
} from "@/app/actions/field/field-activities";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { FieldInspectionFormDialog } from "@/components/fields/field-inspection-form-dialog";
import { FieldIrrigationFormDialog } from "@/components/fields/field-irrigation-form-dialog";
import { FieldPlantationFormDialog } from "@/components/fields/field-plantation-form-dialog";
import { DeleteConfirmDialog } from "@/components/master/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCreateFieldDehaulming,
  useCreateFieldHarvest,
  useCreateFieldIrrigation,
  useCreateFieldPlantation,
  useCreateFieldRouging,
  useCreateFieldStripTest,
  useDeleteFieldDehaulming,
  useDeleteFieldHarvest,
  useDeleteFieldIrrigation,
  useDeleteFieldPlantation,
  useDeleteFieldRouging,
  useDeleteFieldStripTest,
  useUpdateFieldDehaulming,
  useUpdateFieldHarvest,
  useUpdateFieldIrrigation,
  useUpdateFieldPlantation,
  useUpdateFieldRouging,
  useUpdateFieldStripTest,
} from "@/hooks/field/use-field-detail";
import { formatDisplayDate } from "@/lib/date";
import {
  getFieldStageTitle,
  type FieldActivityStageId,
} from "@/lib/field/step-state";
import type { FieldActivityRound } from "@/lib/schemas/field/shared";

type FieldActivityPanelProps = {
  fieldId: string;
  detail: FieldDetail;
  stageId: FieldActivityStageId;
  canWriteMaster: boolean;
};

function ImageLink({ url }: { url: string | null }) {
  if (!url) return "—";

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="text-primary hover:underline"
    >
      View image
    </a>
  );
}

function TextValue({ value }: { value: string | null | undefined }) {
  return value?.trim() ? value : "—";
}

function createActionsColumn<T extends { id: string }>(options: {
  canWriteMaster: boolean;
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
}): ColumnDef<T> {
  if (!options.canWriteMaster) {
    return { id: "actions", enableHiding: false, cell: () => null };
  }

  return {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => options.onEdit(row.original)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => options.onDelete(row.original)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };
}

function filterByRound<T extends { round: FieldActivityRound }>(
  rows: T[],
  round: FieldActivityRound,
) {
  return rows.filter((row) => row.round === round);
}

export function FieldActivityPanel({
  fieldId,
  detail,
  stageId,
  canWriteMaster,
}: FieldActivityPanelProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedPlantation, setSelectedPlantation] =
    useState<FieldPlantationRow | null>(null);
  const [selectedIrrigation, setSelectedIrrigation] =
    useState<FieldIrrigationRow | null>(null);
  const [selectedInspection, setSelectedInspection] =
    useState<FieldInspectionRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);

  const createPlantation = useCreateFieldPlantation(fieldId);
  const updatePlantation = useUpdateFieldPlantation(fieldId);
  const deletePlantation = useDeleteFieldPlantation(fieldId);

  const createIrrigation = useCreateFieldIrrigation(fieldId);
  const updateIrrigation = useUpdateFieldIrrigation(fieldId);
  const deleteIrrigation = useDeleteFieldIrrigation(fieldId);

  const createDehaulming = useCreateFieldDehaulming(fieldId);
  const updateDehaulming = useUpdateFieldDehaulming(fieldId);
  const deleteDehaulming = useDeleteFieldDehaulming(fieldId);

  const createRouging = useCreateFieldRouging(fieldId);
  const updateRouging = useUpdateFieldRouging(fieldId);
  const deleteRouging = useDeleteFieldRouging(fieldId);

  const createStripTest = useCreateFieldStripTest(fieldId);
  const updateStripTest = useUpdateFieldStripTest(fieldId);
  const deleteStripTest = useDeleteFieldStripTest(fieldId);

  const createHarvest = useCreateFieldHarvest(fieldId);
  const updateHarvest = useUpdateFieldHarvest(fieldId);
  const deleteHarvest = useDeleteFieldHarvest(fieldId);

  const stageTitle = getFieldStageTitle(stageId);

  const plantationColumns = useMemo<ColumnDef<FieldPlantationRow>[]>(
    () => [
      {
        accessorKey: "plantedAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ row }) => formatDisplayDate(row.original.plantedAt),
      },
      {
        accessorKey: "varietyName",
        header: "Variety",
      },
      {
        accessorKey: "sizeName",
        header: "Size",
      },
      {
        accessorKey: "bagCount",
        header: "Bags",
      },
      {
        accessorKey: "acresPlanted",
        header: "Acres",
      },
      {
        accessorKey: "imageUrl",
        header: "Image",
        cell: ({ row }) => <ImageLink url={row.original.imageUrl} />,
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => <TextValue value={row.original.remarks} />,
      },
      createActionsColumn<FieldPlantationRow>({
        canWriteMaster,
        onEdit: (row) => {
          setMode("edit");
          setSelectedPlantation(row);
          setFormOpen(true);
        },
        onDelete: (row) => {
          setDeleteTarget({ id: row.id, label: "plantation record" });
          setDeleteOpen(true);
        },
      }),
    ],
    [canWriteMaster],
  );

  const irrigationColumns = useMemo<ColumnDef<FieldIrrigationRow>[]>(
    () => [
      {
        accessorKey: "irrigatedAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ row }) => formatDisplayDate(row.original.irrigatedAt),
      },
      {
        accessorKey: "cycleNumber",
        header: "Cycle",
      },
      {
        accessorKey: "imageUrl",
        header: "Image",
        cell: ({ row }) => <ImageLink url={row.original.imageUrl} />,
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => <TextValue value={row.original.remarks} />,
      },
      createActionsColumn<FieldIrrigationRow>({
        canWriteMaster,
        onEdit: (row) => {
          setMode("edit");
          setSelectedIrrigation(row);
          setFormOpen(true);
        },
        onDelete: (row) => {
          setDeleteTarget({ id: row.id, label: "irrigation record" });
          setDeleteOpen(true);
        },
      }),
    ],
    [canWriteMaster],
  );

  const inspectionColumns = useMemo<ColumnDef<FieldInspectionRow>[]>(
    () => [
      {
        accessorKey: "activityDate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ row }) => formatDisplayDate(row.original.activityDate),
      },
      {
        accessorKey: "result",
        header: "Result",
        cell: ({ row }) => <TextValue value={row.original.result} />,
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => <TextValue value={row.original.remarks} />,
      },
      {
        accessorKey: "imageUrl",
        header: "Image",
        cell: ({ row }) => <ImageLink url={row.original.imageUrl} />,
      },
      createActionsColumn<FieldInspectionRow>({
        canWriteMaster,
        onEdit: (row) => {
          setMode("edit");
          setSelectedInspection(row);
          setFormOpen(true);
        },
        onDelete: (row) => {
          setDeleteTarget({ id: row.id, label: `${stageTitle.toLowerCase()} record` });
          setDeleteOpen(true);
        },
      }),
    ],
    [canWriteMaster, stageTitle],
  );

  function openCreateDialog() {
    setMode("create");
    setSelectedPlantation(null);
    setSelectedIrrigation(null);
    setSelectedInspection(null);
    setFormOpen(true);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;

    const onSuccess = () => {
      setDeleteOpen(false);
      setDeleteTarget(null);
    };

    switch (stageId) {
      case "plantation":
        deletePlantation.mutate(deleteTarget.id, { onSuccess });
        break;
      case "irrigation":
        deleteIrrigation.mutate(deleteTarget.id, { onSuccess });
        break;
      case "dehaulming-first":
      case "dehaulming-second":
        deleteDehaulming.mutate(deleteTarget.id, { onSuccess });
        break;
      case "rouging":
        deleteRouging.mutate(deleteTarget.id, { onSuccess });
        break;
      case "strip-test-first":
      case "strip-test-second":
        deleteStripTest.mutate(deleteTarget.id, { onSuccess });
        break;
      case "harvest":
        deleteHarvest.mutate(deleteTarget.id, { onSuccess });
        break;
    }
  }

  function renderTable() {
    switch (stageId) {
      case "plantation":
        return (
          <DataTable
            columns={plantationColumns}
            data={detail.plantations}
            filterColumn="varietyName"
            filterPlaceholder="Search plantations…"
          />
        );
      case "irrigation":
        return (
          <DataTable
            columns={irrigationColumns}
            data={detail.irrigations}
            filterColumn="cycleNumber"
            filterPlaceholder="Search cycles…"
          />
        );
      case "dehaulming-first":
        return (
          <DataTable
            columns={inspectionColumns}
            data={filterByRound(detail.dehaulming, "FIRST")}
            filterColumn="result"
            filterPlaceholder="Search records…"
          />
        );
      case "dehaulming-second":
        return (
          <DataTable
            columns={inspectionColumns}
            data={filterByRound(detail.dehaulming, "SECOND")}
            filterColumn="result"
            filterPlaceholder="Search records…"
          />
        );
      case "rouging":
        return (
          <DataTable
            columns={inspectionColumns}
            data={detail.rouging}
            filterColumn="result"
            filterPlaceholder="Search records…"
          />
        );
      case "strip-test-first":
        return (
          <DataTable
            columns={inspectionColumns}
            data={filterByRound(detail.stripTests, "FIRST")}
            filterColumn="result"
            filterPlaceholder="Search records…"
          />
        );
      case "strip-test-second":
        return (
          <DataTable
            columns={inspectionColumns}
            data={filterByRound(detail.stripTests, "SECOND")}
            filterColumn="result"
            filterPlaceholder="Search records…"
          />
        );
      case "harvest":
        return (
          <DataTable
            columns={inspectionColumns}
            data={detail.harvests}
            filterColumn="result"
            filterPlaceholder="Search records…"
          />
        );
    }
  }

  const isPending =
    createPlantation.isPending ||
    updatePlantation.isPending ||
    createIrrigation.isPending ||
    updateIrrigation.isPending ||
    createDehaulming.isPending ||
    updateDehaulming.isPending ||
    createRouging.isPending ||
    updateRouging.isPending ||
    createStripTest.isPending ||
    updateStripTest.isPending ||
    createHarvest.isPending ||
    updateHarvest.isPending;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <CardTitle>{stageTitle}</CardTitle>
            <CardDescription>
              Activity records for this field stage
            </CardDescription>
          </div>
          {canWriteMaster ? (
            <Button onClick={openCreateDialog}>
              <Plus />
              Add record
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>{renderTable()}</CardContent>
      </Card>

      {stageId === "plantation" ? (
        <FieldPlantationFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          mode={mode}
          initialRecord={selectedPlantation}
          isPending={isPending}
          onSubmit={(values) => {
            if (mode === "create") {
              createPlantation.mutate(values, {
                onSuccess: () => setFormOpen(false),
              });
              return;
            }

            if (!selectedPlantation) return;

            updatePlantation.mutate(
              { id: selectedPlantation.id, ...values },
              { onSuccess: () => setFormOpen(false) },
            );
          }}
        />
      ) : null}

      {stageId === "irrigation" ? (
        <FieldIrrigationFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          mode={mode}
          initialRecord={selectedIrrigation}
          isPending={isPending}
          onSubmit={(values) => {
            if (mode === "create") {
              createIrrigation.mutate(values, {
                onSuccess: () => setFormOpen(false),
              });
              return;
            }

            if (!selectedIrrigation) return;

            updateIrrigation.mutate(
              { id: selectedIrrigation.id, ...values },
              { onSuccess: () => setFormOpen(false) },
            );
          }}
        />
      ) : null}

      {stageId === "dehaulming-first" ||
      stageId === "dehaulming-second" ||
      stageId === "rouging" ||
      stageId === "strip-test-first" ||
      stageId === "strip-test-second" ||
      stageId === "harvest" ? (
        <FieldInspectionFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          mode={mode}
          title={stageTitle}
          description={`Record ${stageTitle.toLowerCase()} details for this field.`}
          initialRecord={selectedInspection}
          isPending={isPending}
          onSubmit={(values) => {
            if (mode === "create") {
              if (stageId === "dehaulming-first") {
                createDehaulming.mutate(
                  { ...values, round: "FIRST" },
                  { onSuccess: () => setFormOpen(false) },
                );
              } else if (stageId === "dehaulming-second") {
                createDehaulming.mutate(
                  { ...values, round: "SECOND" },
                  { onSuccess: () => setFormOpen(false) },
                );
              } else if (stageId === "rouging") {
                createRouging.mutate(values, {
                  onSuccess: () => setFormOpen(false),
                });
              } else if (stageId === "strip-test-first") {
                createStripTest.mutate(
                  { ...values, round: "FIRST" },
                  { onSuccess: () => setFormOpen(false) },
                );
              } else if (stageId === "strip-test-second") {
                createStripTest.mutate(
                  { ...values, round: "SECOND" },
                  { onSuccess: () => setFormOpen(false) },
                );
              } else {
                createHarvest.mutate(values, {
                  onSuccess: () => setFormOpen(false),
                });
              }
              return;
            }

            if (!selectedInspection) return;

            if (
              stageId === "dehaulming-first" ||
              stageId === "dehaulming-second"
            ) {
              updateDehaulming.mutate(
                { id: selectedInspection.id, ...values },
                { onSuccess: () => setFormOpen(false) },
              );
            } else if (stageId === "rouging") {
              updateRouging.mutate(
                { id: selectedInspection.id, ...values },
                { onSuccess: () => setFormOpen(false) },
              );
            } else if (
              stageId === "strip-test-first" ||
              stageId === "strip-test-second"
            ) {
              updateStripTest.mutate(
                { id: selectedInspection.id, ...values },
                { onSuccess: () => setFormOpen(false) },
              );
            } else {
              updateHarvest.mutate(
                { id: selectedInspection.id, ...values },
                { onSuccess: () => setFormOpen(false) },
              );
            }
          }}
        />
      ) : null}

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${deleteTarget?.label ?? "record"}?`}
        description="This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        isPending={
          deletePlantation.isPending ||
          deleteIrrigation.isPending ||
          deleteDehaulming.isPending ||
          deleteRouging.isPending ||
          deleteStripTest.isPending ||
          deleteHarvest.isPending
        }
      />
    </>
  );
}
