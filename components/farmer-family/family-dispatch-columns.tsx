"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { FamilyDispatchRow } from "@/app/actions/farmer/farmer-family-profile";
import { createFarmerDispatchColumns } from "@/components/farmers/farmer-dispatch-columns";
import { createMemberColumn } from "@/components/farmer-family/member-column";

export function createFamilyDispatchColumns(): ColumnDef<FamilyDispatchRow>[] {
  return [
    createMemberColumn<FamilyDispatchRow>(),
    ...(createFarmerDispatchColumns() as ColumnDef<FamilyDispatchRow>[]),
  ];
}
