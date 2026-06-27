"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import type { FarmerFieldRow } from "@/app/actions/farmer/farmer-fields";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FarmerFieldColumnActions = {
  canWriteMaster: boolean;
  onEdit: (row: FarmerFieldRow) => void;
  onDelete: (row: FarmerFieldRow) => void;
};

function formatGeoLocation(value: string) {
  const coords = value.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!coords) {
    return value;
  }

  const [, lat, , lng] = coords;
  return (
    <a
      href={`https://www.google.com/maps?q=${lat},${lng}`}
      target="_blank"
      rel="noreferrer"
      className="text-primary hover:underline"
    >
      {value}
    </a>
  );
}

export function createFarmerFieldColumns(
  actions: FarmerFieldColumnActions,
): ColumnDef<FarmerFieldRow>[] {
  const columns: ColumnDef<FarmerFieldRow>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/fields/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "geoLocation",
      header: "Geo location",
      cell: ({ row }) => formatGeoLocation(row.original.geoLocation),
    },
    {
      accessorKey: "acres",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Acres" />
      ),
    },
  ];

  if (actions.canWriteMaster) {
    columns.push({
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
            <DropdownMenuItem asChild>
              <Link href={`/fields/${row.original.id}`}>View</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => actions.onEdit(row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => actions.onDelete(row.original)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    });
  }

  return columns;
}
