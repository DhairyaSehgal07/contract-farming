"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MapPin, MoreHorizontal, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { LocalityRow } from "@/app/actions/master/localities";
import type { StationRow } from "@/app/actions/master/stations";
import { DataTable } from "@/components/data-table/data-table";
import { DeleteConfirmDialog } from "@/components/master/delete-confirm-dialog";
import { MasterSectionHeader } from "@/components/master/master-section-header";
import { MasterTableSkeleton } from "@/components/master/master-table-skeleton";
import { createLocalityColumns } from "@/components/master/stations/locality-columns";
import { LocalityFormDialog } from "@/components/master/stations/locality-form-dialog";
import { StationFormDialog } from "@/components/master/stations/station-form-dialog";
import { StationListSkeleton } from "@/components/master/stations/station-list-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  useCreateLocality,
  useDeleteLocality,
  useLocalities,
  useUpdateLocality,
} from "@/hooks/master/use-localities";
import {
  useCreateStation,
  useDeleteStation,
  useStations,
  useUpdateStation,
} from "@/hooks/master/use-stations";
import { cn } from "@/lib/utils";

export function StationsSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedStationId = searchParams.get("stationId");

  const { data: stations = [], isLoading: stationsLoading } = useStations();
  const {
    data: localities = [],
    isLoading: localitiesLoading,
    isError: localitiesError,
    error: localitiesErrorMessage,
  } = useLocalities(selectedStationId);

  const createStationMutation = useCreateStation();
  const updateStationMutation = useUpdateStation();
  const deleteStationMutation = useDeleteStation();
  const createLocalityMutation = useCreateLocality(selectedStationId);
  const updateLocalityMutation = useUpdateLocality(selectedStationId);
  const deleteLocalityMutation = useDeleteLocality(selectedStationId);

  const [stationFormOpen, setStationFormOpen] = useState(false);
  const [stationFormMode, setStationFormMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingStation, setEditingStation] = useState<StationRow | null>(null);
  const [deleteStationOpen, setDeleteStationOpen] = useState(false);
  const [deletingStation, setDeletingStation] = useState<StationRow | null>(
    null,
  );

  const [localityFormOpen, setLocalityFormOpen] = useState(false);
  const [localityFormMode, setLocalityFormMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingLocality, setEditingLocality] = useState<LocalityRow | null>(
    null,
  );
  const [deleteLocalityOpen, setDeleteLocalityOpen] = useState(false);
  const [deletingLocality, setDeletingLocality] = useState<LocalityRow | null>(
    null,
  );

  const selectedStation = stations.find(
    (station) => station.id === selectedStationId,
  );

  const localityColumns = useMemo<ColumnDef<LocalityRow>[]>(
    () =>
      createLocalityColumns({
        onEdit: (row) => {
          setLocalityFormMode("edit");
          setEditingLocality(row);
          setLocalityFormOpen(true);
        },
        onDelete: (row) => {
          setDeletingLocality(row);
          setDeleteLocalityOpen(true);
        },
      }),
    [],
  );

  function selectStation(stationId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("stationId", stationId);
    router.push(`/master/stations?${params.toString()}`);
  }

  function handleStationCreateOpen() {
    setStationFormMode("create");
    setEditingStation(null);
    setStationFormOpen(true);
  }

  function handleStationSubmit(values: { name: string }) {
    if (stationFormMode === "create") {
      createStationMutation.mutate(values, {
        onSuccess: (station) => {
          setStationFormOpen(false);
          selectStation(station.id);
        },
      });
      return;
    }

    if (!editingStation) return;

    updateStationMutation.mutate(
      { id: editingStation.id, name: values.name },
      {
        onSuccess: () => {
          setStationFormOpen(false);
          setEditingStation(null);
        },
      },
    );
  }

  function handleStationDeleteConfirm() {
    if (!deletingStation) return;

    deleteStationMutation.mutate(deletingStation.id, {
      onSuccess: () => {
        if (selectedStationId === deletingStation.id) {
          router.push("/master/stations");
        }
        setDeleteStationOpen(false);
        setDeletingStation(null);
      },
    });
  }

  function handleLocalitySubmit(values: {
    name: string;
    city: string;
    state: string;
    postalCode: string;
  }) {
    if (!selectedStationId) return;

    if (localityFormMode === "create") {
      createLocalityMutation.mutate(
        { ...values, stationId: selectedStationId },
        { onSuccess: () => setLocalityFormOpen(false) },
      );
      return;
    }

    if (!editingLocality) return;

    updateLocalityMutation.mutate(
      {
        id: editingLocality.id,
        stationId: selectedStationId,
        ...values,
      },
      {
        onSuccess: () => {
          setLocalityFormOpen(false);
          setEditingLocality(null);
        },
      },
    );
  }

  function handleLocalityDeleteConfirm() {
    if (!deletingLocality) return;

    deleteLocalityMutation.mutate(deletingLocality.id, {
      onSuccess: () => {
        setDeleteLocalityOpen(false);
        setDeletingLocality(null);
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <MasterSectionHeader
        title="Stations & Localities"
        description="Manage stations and the localities within each station."
        actionLabel="Add Station"
        onAction={handleStationCreateOpen}
      />

      <Card>
        <CardContent className="p-0">
          <div className="grid lg:grid-cols-2">
            <div className="flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="text-base">Stations</CardTitle>
              </CardHeader>
              <div className="flex flex-col p-2">
                {stationsLoading ? (
                  <StationListSkeleton />
                ) : stations.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    No stations yet.
                  </p>
                ) : (
                  stations.map((station) => (
                    <div
                      key={station.id}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-2 py-1",
                        selectedStationId === station.id && "bg-accent",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => selectStation(station.id)}
                        className={cn(
                          "min-w-0 flex-1 rounded-md px-2 py-1.5 text-left text-sm",
                          selectedStationId === station.id
                            ? "font-medium text-accent-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <span className="block truncate">{station.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {station._count.localities} localities ·{" "}
                          {station._count.farmers} farmers
                        </span>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <span className="sr-only">Station actions</span>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setStationFormMode("edit");
                              setEditingStation(station);
                              setStationFormOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              setDeletingStation(station);
                              setDeleteStationOpen(true);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-col border-t lg:border-t-0 lg:border-l">
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <CardTitle className="text-base">
                  {selectedStation
                    ? `Localities — ${selectedStation.name}`
                    : "Localities"}
                </CardTitle>
                <Button
                  size="sm"
                  disabled={!selectedStationId}
                  onClick={() => {
                    setLocalityFormMode("create");
                    setEditingLocality(null);
                    setLocalityFormOpen(true);
                  }}
                >
                  <Plus />
                  Add Locality
                </Button>
              </CardHeader>

              {!selectedStationId ? (
                <Empty className="border-0">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MapPin />
                    </EmptyMedia>
                    <EmptyTitle>No station selected</EmptyTitle>
                    <EmptyDescription>
                      Select a station to view and manage its localities.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : localitiesLoading ? (
                <div className="p-4">
                  <MasterTableSkeleton columnCount={5} rowCount={4} />
                </div>
              ) : localitiesError ? (
                <p className="p-6 text-sm text-destructive">
                  {localitiesErrorMessage.message}
                </p>
              ) : (
                <div className="p-4">
                  <DataTable
                    columns={localityColumns}
                    data={localities}
                    filterColumn="name"
                    filterPlaceholder="Search localities…"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <StationFormDialog
        open={stationFormOpen}
        onOpenChange={setStationFormOpen}
        mode={stationFormMode}
        initialName={editingStation?.name ?? ""}
        isPending={
          createStationMutation.isPending || updateStationMutation.isPending
        }
        onSubmit={handleStationSubmit}
      />

      <LocalityFormDialog
        open={localityFormOpen}
        onOpenChange={setLocalityFormOpen}
        mode={localityFormMode}
        initialValues={{
          name: editingLocality?.name ?? "",
          city: editingLocality?.city ?? "",
          state: editingLocality?.state ?? "",
          postalCode: editingLocality?.postalCode ?? "",
        }}
        isPending={
          createLocalityMutation.isPending || updateLocalityMutation.isPending
        }
        onSubmit={handleLocalitySubmit}
      />

      <DeleteConfirmDialog
        open={deleteStationOpen}
        onOpenChange={setDeleteStationOpen}
        title="Delete station"
        description={
          deletingStation
            ? `Are you sure you want to delete "${deletingStation.name}"? This cannot be undone.`
            : ""
        }
        onConfirm={handleStationDeleteConfirm}
        isPending={deleteStationMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteLocalityOpen}
        onOpenChange={setDeleteLocalityOpen}
        title="Delete locality"
        description={
          deletingLocality
            ? `Are you sure you want to delete "${deletingLocality.name}"? This cannot be undone.`
            : ""
        }
        onConfirm={handleLocalityDeleteConfirm}
        isPending={deleteLocalityMutation.isPending}
      />
    </div>
  );
}
