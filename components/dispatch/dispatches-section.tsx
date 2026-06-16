"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import type { DispatchRow } from "@/app/actions/dispatch/dispatches";
import { DataTable } from "@/components/data-table/data-table";
import { createDispatchColumns } from "@/components/dispatch/dispatch-columns";
import { MasterSectionHeader } from "@/components/master/master-section-header";
import { MasterTableSkeleton } from "@/components/master/master-table-skeleton";
import { useDispatches } from "@/hooks/dispatch/use-dispatches";

type DispatchesSectionProps = {
  canWrite: boolean;
};

export function DispatchesSection({ canWrite }: DispatchesSectionProps) {
  const { data = [], isPending, isError, error } = useDispatches();

  const columns = useMemo<ColumnDef<DispatchRow>[]>(
    () => createDispatchColumns(),
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <MasterSectionHeader
        title="Dispatch"
        description="Manage seed dispatches and truck movements."
        actionLabel="Add Dispatch"
        actionHref={canWrite ? "/dispatch/new" : undefined}
      />

      {isPending ? (
        <MasterTableSkeleton columnCount={10} rowCount={6} />
      ) : isError ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          filterColumn="truckNumber"
          filterPlaceholder="Search truck numbers…"
        />
      )}
    </div>
  );
}
