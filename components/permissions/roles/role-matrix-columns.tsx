"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { RoleMatrixRow } from "@/components/permissions/roles/role-matrix-types";
import { rowHasAnyGrant } from "@/components/permissions/roles/role-matrix-types";
import { Checkbox } from "@/components/ui/checkbox";
import type { AppAction, AppResource } from "@/lib/auth/permission-catalog";
import { cn } from "@/lib/utils";

type RoleMatrixColumnActions = {
  onToggle: (resource: AppResource, action: AppAction, checked: boolean) => void;
};

function ActionHeader({ title }: { title: string }) {
  return (
    <div className="text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
      {title}
    </div>
  );
}

function PermissionCheckbox({
  resource,
  action,
  value,
  onToggle,
}: {
  resource: AppResource;
  action: AppAction;
  value: boolean | null;
  onToggle: RoleMatrixColumnActions["onToggle"];
}) {
  if (value === null) {
    return null;
  }

  const id = `${resource}-${action}`;

  return (
    <div className="flex justify-center">
      <Checkbox
        id={id}
        checked={value}
        onCheckedChange={(checked) =>
          onToggle(resource, action, checked === true)
        }
        aria-label={`${resource} ${action}`}
      />
    </div>
  );
}

export function createRoleMatrixColumns({
  onToggle,
}: RoleMatrixColumnActions): ColumnDef<RoleMatrixRow>[] {
  return [
    {
      accessorKey: "resource",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Resource" />
      ),
      cell: ({ row }) => {
        const hasGrant = rowHasAnyGrant(row.original);
        return (
          <div className="flex items-center gap-2 font-medium">
            <span
              className={cn(
                "size-2 shrink-0 rounded-full",
                hasGrant ? "bg-primary" : "bg-muted-foreground/30",
              )}
              aria-hidden
            />
            {row.original.resource}
          </div>
        );
      },
    },
    {
      accessorKey: "read",
      header: () => <ActionHeader title="Read" />,
      enableSorting: false,
      cell: ({ row }) => (
        <PermissionCheckbox
          resource={row.original.resource}
          action="read"
          value={row.original.read}
          onToggle={onToggle}
        />
      ),
    },
    {
      accessorKey: "write",
      header: () => <ActionHeader title="Write" />,
      enableSorting: false,
      cell: ({ row }) => (
        <PermissionCheckbox
          resource={row.original.resource}
          action="write"
          value={row.original.write}
          onToggle={onToggle}
        />
      ),
    },
  ];
}
