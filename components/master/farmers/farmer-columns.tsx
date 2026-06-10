"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import type { FarmerRow } from "@/app/actions/master/farmers";
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

type FarmerColumnActions = {
  onEdit: (row: FarmerRow) => void;
  onDelete: (row: FarmerRow) => void;
};

export function createFarmerColumns(
  actions: FarmerColumnActions,
): ColumnDef<FarmerRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "accountNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account number" />
      ),
    },
    {
      accessorKey: "mobileNumber",
      header: "Mobile",
    },
    {
      id: "station",
      accessorFn: (row) => row.station.name,
      header: "Station",
    },
    {
      id: "locality",
      accessorFn: (row) => row.locality.name,
      header: "Locality",
    },
    {
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
    },
  ];
}
