"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
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

const NO_FAMILY_ACCOUNT = "No family account";

export function getFarmerFamilyAccount(row: FarmerRow) {
  return row.family?.accountNumber ?? NO_FAMILY_ACCOUNT;
}

function formatFamilyGroupLabel(row: {
  getValue: (columnId: string) => unknown;
  subRows: { original: FarmerRow }[];
}) {
  const account = String(row.getValue("familyAccount") ?? NO_FAMILY_ACCOUNT);
  const count = row.subRows.length;
  const farmerLabel = count === 1 ? "farmer" : "farmers";

  if (account === NO_FAMILY_ACCOUNT) {
    return `${account} (${count} ${farmerLabel})`;
  }

  const familyName = row.subRows[0]?.original.family?.name;
  return familyName
    ? `${account} · ${familyName} (${count} ${farmerLabel})`
    : `${account} (${count} ${farmerLabel})`;
}

type FarmerColumnActions = {
  canWriteMaster: boolean;
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
      cell: ({ row }) => {
        if (row.getIsGrouped()) {
          return null;
        }

        return (
          <Link
            href={`/farmers/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        );
      },
    },
    {
      accessorKey: "accountNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account number" />
      ),
      cell: ({ row, getValue }) => (row.getIsGrouped() ? null : getValue()),
    },
    {
      id: "familyAccount",
      accessorFn: (row) => getFarmerFamilyAccount(row),
      enableGrouping: true,
      aggregationFn: "count",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Family account" />
      ),
      cell: ({ row }) => {
        if (row.getIsGrouped()) {
          const familyId = row.subRows[0]?.original.family?.id;
          const label = formatFamilyGroupLabel(row);

          if (familyId) {
            return (
              <Link
                href={`/farmer-family/${familyId}`}
                className="font-medium hover:underline"
              >
                {label}
              </Link>
            );
          }

          return <span className="font-medium">{label}</span>;
        }

        return row.original.family?.accountNumber ?? "—";
      },
    },
    {
      accessorKey: "mobileNumber",
      header: "Mobile",
      cell: ({ row, getValue }) => (row.getIsGrouped() ? null : getValue()),
    },
    {
      id: "station",
      accessorFn: (row) => row.station.name,
      header: "Station",
      cell: ({ row, getValue }) => (row.getIsGrouped() ? null : getValue()),
    },
    {
      id: "locality",
      accessorFn: (row) => row.locality.name,
      header: "Locality",
      cell: ({ row, getValue }) => (row.getIsGrouped() ? null : getValue()),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        if (row.getIsGrouped()) {
          return null;
        }

        return (
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
                <Link href={`/farmers/${row.original.id}`}>View</Link>
              </DropdownMenuItem>
              {actions.canWriteMaster ? (
                <>
                  <DropdownMenuSeparator />
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
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
