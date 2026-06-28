"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { FamilyReceivedLotRow } from "@/app/actions/farmer/farmer-family-profile";
import { createFarmerReceivedLotColumns } from "@/components/farmers/farmer-received-lot-columns";
import { createMemberColumn } from "@/components/farmer-family/member-column";

export function createFamilyReceivedLotColumns(): ColumnDef<FamilyReceivedLotRow>[] {
  return [
    createMemberColumn<FamilyReceivedLotRow>(),
    ...(createFarmerReceivedLotColumns() as ColumnDef<FamilyReceivedLotRow>[]),
  ];
}
