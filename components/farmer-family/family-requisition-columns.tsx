"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { RequisitionRow } from "@/app/actions/requisition/requisitions";
import { createFarmerRequisitionColumns } from "@/components/farmers/farmer-requisition-columns";
import { createRequisitionMemberColumn } from "@/components/farmer-family/member-column";

export function createFamilyRequisitionColumns(): ColumnDef<RequisitionRow>[] {
  return [
    createRequisitionMemberColumn(),
    ...createFarmerRequisitionColumns(),
  ];
}
