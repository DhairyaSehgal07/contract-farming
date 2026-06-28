"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { FamilyFieldRow } from "@/app/actions/farmer/farmer-family-profile";
import { createFarmerFieldColumns } from "@/components/farmers/farmer-field-columns";
import { createMemberColumn } from "@/components/farmer-family/member-column";

type FamilyFieldColumnActions = {
  canWriteMaster: boolean;
  onEdit: (row: FamilyFieldRow) => void;
  onDelete: (row: FamilyFieldRow) => void;
};

export function createFamilyFieldColumns(
  actions: FamilyFieldColumnActions,
): ColumnDef<FamilyFieldRow>[] {
  const farmerColumns = createFarmerFieldColumns({
    canWriteMaster: actions.canWriteMaster,
    onEdit: (row) => actions.onEdit(row as FamilyFieldRow),
    onDelete: (row) => actions.onDelete(row as FamilyFieldRow),
  });

  return [
    createMemberColumn<FamilyFieldRow>(),
    ...(farmerColumns as ColumnDef<FamilyFieldRow>[]),
  ];
}
