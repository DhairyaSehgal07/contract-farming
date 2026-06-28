"use server";

import type { FarmerFieldRow } from "@/app/actions/farmer/farmer-fields";
import type {
  FarmerDispatchRow,
  FarmerReceivedLotRow,
} from "@/app/actions/farmer/farmer-profile";
import type { RequisitionRow } from "@/app/actions/requisition/requisitions";
import type { FarmerStockRow } from "@/app/actions/transfer/stock-transfers";
import {
  DispatchLotStatus,
  DispatchStatus,
} from "@/app/generated/prisma/client";
import type { RequisitionStatus } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";
import { requireFarmerReadAction } from "@/lib/schemas/farmer/auth";
import {
  type ActionResult,
  actionError,
  actionSuccess,
} from "@/lib/schemas/master/action-result";
import { getPrismaErrorMessage } from "@/lib/schemas/master/prisma-errors";
import { requireTransferReadAction } from "@/lib/schemas/transfer/auth";
import { aggregateFamilyStock } from "@/lib/transfer/aggregate-family-stock";

const familyProfileInclude = {
  station: { select: { name: true } },
  locality: { select: { name: true } },
  members: {
    select: { id: true, name: true, accountNumber: true },
    orderBy: { accountNumber: "asc" as const },
  },
  _count: { select: { members: true } },
} as const;

export type FarmerFamilyProfileRow = {
  id: string;
  accountNumber: string;
  name: string;
  stationId: string;
  localityId: string;
  createdAt: Date;
  updatedAt: Date;
  station: { name: string };
  locality: { name: string };
  members: { id: string; name: string; accountNumber: string }[];
  _count: { members: number };
};

export type FamilyDispatchRow = FarmerDispatchRow & {
  farmerId: string;
  farmer: { id: string; name: string; accountNumber: string };
};

export type FamilyReceivedLotRow = FarmerReceivedLotRow & {
  farmerId: string;
  farmer: { id: string; name: string; accountNumber: string };
};

export type FamilyFieldRow = FarmerFieldRow & {
  farmer: { id: string; name: string; accountNumber: string };
};

const familyRequisitionInclude = {
  farmer: { select: { id: true, name: true, accountNumber: true } },
  variety: { select: { name: true } },
  createdBy: { select: { name: true } },
  reviewedBy: { select: { name: true } },
} as const;

const familyDispatchInclude = {
  location: { select: { name: true } },
  requisitions: {
    include: {
      requisition: {
        include: {
          farmer: {
            select: {
              id: true,
              name: true,
              accountNumber: true,
              familyId: true,
            },
          },
          variety: { select: { name: true } },
        },
      },
      lot: {
        select: {
          status: true,
          receivedAt: true,
        },
      },
    },
  },
} as const;

const familyReceivedLotInclude = {
  receivedBy: { select: { name: true } },
  dispatchRequisition: {
    include: {
      dispatch: { select: { id: true, dispatchDate: true } },
      requisition: {
        include: {
          farmer: { select: { id: true, name: true, accountNumber: true } },
          variety: { select: { name: true } },
        },
      },
      sizeLines: {
        include: {
          size: { select: { name: true } },
          generation: { select: { name: true } },
        },
        orderBy: [
          { size: { name: "asc" as const } },
          { generation: { name: "asc" as const } },
        ],
      },
    },
  },
};

type FamilyRequisitionWithRelations = Awaited<
  ReturnType<
    typeof prisma.requisition.findMany<{
      include: typeof familyRequisitionInclude;
    }>
  >
>[number];

type FamilyDispatchWithRelations = Awaited<
  ReturnType<
    typeof prisma.dispatch.findMany<{
      include: typeof familyDispatchInclude;
    }>
  >
>[number];

type FamilyReceivedLotWithRelations = Awaited<
  ReturnType<
    typeof prisma.dispatchLot.findMany<{
      include: typeof familyReceivedLotInclude;
    }>
  >
>[number];

async function requireFamilyExists(familyId: string) {
  const family = await prisma.farmerFamily.findUnique({
    where: { id: familyId },
    select: { id: true },
  });

  if (!family) {
    return actionError("Family not found.");
  }

  return null;
}

function serializeFamilyRequisition(
  row: FamilyRequisitionWithRelations,
): RequisitionRow {
  return {
    id: row.id,
    requisitionDate: row.requisitionDate.toISOString().slice(0, 10),
    requestedDeliveryDate: row.requestedDeliveryDate.toISOString().slice(0, 10),
    acres: row.acres?.toString() ?? null,
    initialQuantity: row.initialQuantity?.toString() ?? null,
    status: row.status as RequisitionStatus,
    remarks: row.remarks,
    rejectionRemarks: row.rejectionRemarks,
    farmerId: row.farmerId,
    varietyId: row.varietyId,
    createdById: row.createdById,
    reviewedById: row.reviewedById,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    approvalDate: row.approvalDate?.toISOString().slice(0, 10) ?? null,
    rejectionDate: row.rejectionDate?.toISOString().slice(0, 10) ?? null,
    approvedDeliveryDate:
      row.approvedDeliveryDate?.toISOString().slice(0, 10) ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    farmer: row.farmer,
    variety: row.variety,
    createdBy: row.createdBy,
    reviewedBy: row.reviewedBy,
  };
}

function serializeFamilyDispatchRows(
  row: FamilyDispatchWithRelations,
  familyId: string,
): FamilyDispatchRow[] {
  return row.requisitions
    .filter(
      (assignment) => assignment.requisition.farmer.familyId === familyId,
    )
    .map((assignment) => ({
      dispatchId: row.id,
      dispatchDate: row.dispatchDate?.toISOString().slice(0, 10) ?? null,
      status: row.status as DispatchStatus,
      location: row.location,
      variety: assignment.requisition.variety,
      lotStatus: assignment.lot?.status ?? "PENDING",
      receivedAt: assignment.lot?.receivedAt?.toISOString() ?? null,
      requisitionId: assignment.requisitionId,
      farmerId: assignment.requisition.farmerId,
      farmer: {
        id: assignment.requisition.farmer.id,
        name: assignment.requisition.farmer.name,
        accountNumber: assignment.requisition.farmer.accountNumber,
      },
    }));
}

function serializeFamilyReceivedLot(
  row: FamilyReceivedLotWithRelations,
): FamilyReceivedLotRow {
  const { dispatchRequisition } = row;
  const totalQuantity = dispatchRequisition.sizeLines.reduce(
    (sum, line) => sum + Number.parseFloat(line.quantity.toString()),
    0,
  );

  return {
    id: row.id,
    dispatchId: dispatchRequisition.dispatch.id,
    dispatchDate:
      dispatchRequisition.dispatch.dispatchDate?.toISOString().slice(0, 10) ??
      null,
    variety: dispatchRequisition.requisition.variety,
    receivedAt: row.receivedAt?.toISOString() ?? "",
    receivedBy: row.receivedBy,
    sizeLines: dispatchRequisition.sizeLines.map((line) => ({
      quantity: line.quantity.toString(),
      size: line.size,
      generation: line.generation,
    })),
    totalQuantity: totalQuantity.toString(),
    farmerId: dispatchRequisition.requisition.farmer.id,
    farmer: dispatchRequisition.requisition.farmer,
  };
}

function serializeFamilyField(row: {
  id: string;
  farmerId: string;
  name: string;
  geoLocation: string;
  acres: { toString(): string };
  createdAt: Date;
  updatedAt: Date;
  farmer: { id: string; name: string; accountNumber: string };
}): FamilyFieldRow {
  return {
    id: row.id,
    farmerId: row.farmerId,
    name: row.name,
    geoLocation: row.geoLocation,
    acres: row.acres.toString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    farmer: row.farmer,
  };
}

export async function getFarmerFamilyProfile(
  id: string,
): Promise<ActionResult<FarmerFamilyProfileRow>> {
  const authError = await requireFarmerReadAction();
  if (authError) return authError;

  if (!id) {
    return actionError("Family is required.");
  }

  try {
    const data = await prisma.farmerFamily.findUnique({
      where: { id },
      include: familyProfileInclude,
    });

    if (!data) {
      return actionError("Family not found.");
    }

    return actionSuccess(data);
  } catch (error) {
    console.error("getFarmerFamilyProfile failed:", error);
    return actionError("Failed to load family.");
  }
}

export async function listFamilyRequisitions(
  familyId: string,
): Promise<ActionResult<RequisitionRow[]>> {
  const authError = await requireFarmerReadAction();
  if (authError) return authError;

  if (!familyId) {
    return actionError("Family is required.");
  }

  const familyError = await requireFamilyExists(familyId);
  if (familyError) return familyError;

  try {
    const rows = await prisma.requisition.findMany({
      where: { farmer: { familyId } },
      orderBy: [{ requisitionDate: "desc" }, { createdAt: "desc" }],
      include: familyRequisitionInclude,
    });

    return actionSuccess(rows.map(serializeFamilyRequisition));
  } catch (error) {
    console.error("listFamilyRequisitions failed:", error);
    return actionError(getPrismaErrorMessage(error, "requisition"));
  }
}

export async function listFamilyDispatches(
  familyId: string,
): Promise<ActionResult<FamilyDispatchRow[]>> {
  const authError = await requireFarmerReadAction();
  if (authError) return authError;

  if (!familyId) {
    return actionError("Family is required.");
  }

  const familyError = await requireFamilyExists(familyId);
  if (familyError) return familyError;

  try {
    const rows = await prisma.dispatch.findMany({
      where: {
        requisitions: {
          some: { requisition: { farmer: { familyId } } },
        },
      },
      orderBy: [{ dispatchDate: "desc" }, { createdAt: "desc" }],
      include: familyDispatchInclude,
    });

    return actionSuccess(
      rows.flatMap((row) => serializeFamilyDispatchRows(row, familyId)),
    );
  } catch (error) {
    console.error("listFamilyDispatches failed:", error);
    return actionError(getPrismaErrorMessage(error, "dispatch"));
  }
}

export async function listFamilyReceivedLots(
  familyId: string,
): Promise<ActionResult<FamilyReceivedLotRow[]>> {
  const authError = await requireFarmerReadAction();
  if (authError) return authError;

  if (!familyId) {
    return actionError("Family is required.");
  }

  const familyError = await requireFamilyExists(familyId);
  if (familyError) return familyError;

  try {
    const rows = await prisma.dispatchLot.findMany({
      where: {
        status: DispatchLotStatus.RECEIVED,
        dispatchRequisition: {
          requisition: { farmer: { familyId } },
        },
      },
      orderBy: { receivedAt: "desc" },
      include: familyReceivedLotInclude,
    });

    return actionSuccess(rows.map(serializeFamilyReceivedLot));
  } catch (error) {
    console.error("listFamilyReceivedLots failed:", error);
    return actionError(getPrismaErrorMessage(error, "dispatch"));
  }
}

export async function listFamilyStock(
  familyId: string,
): Promise<ActionResult<FarmerStockRow[]>> {
  const authError = await requireTransferReadAction();
  if (authError) return authError;

  if (!familyId) {
    return actionError("Family is required.");
  }

  const familyError = await requireFamilyExists(familyId);
  if (familyError) return familyError;

  try {
    const rows = await prisma.farmerStockBalance.findMany({
      where: {
        farmer: { familyId },
        quantity: { gt: 0 },
      },
      include: {
        variety: { select: { id: true, name: true } },
        size: { select: { id: true, name: true } },
        generation: { select: { id: true, name: true } },
      },
    });

    return actionSuccess(aggregateFamilyStock(rows));
  } catch (error) {
    console.error("listFamilyStock failed:", error);
    return actionError(getPrismaErrorMessage(error, "transfer"));
  }
}

export async function listFamilyFields(
  familyId: string,
): Promise<ActionResult<FamilyFieldRow[]>> {
  const authError = await requireFarmerReadAction();
  if (authError) return authError;

  if (!familyId) {
    return actionError("Family is required.");
  }

  const familyError = await requireFamilyExists(familyId);
  if (familyError) return familyError;

  try {
    const rows = await prisma.farmerField.findMany({
      where: { farmer: { familyId } },
      orderBy: [{ farmer: { name: "asc" } }, { name: "asc" }],
      include: {
        farmer: { select: { id: true, name: true, accountNumber: true } },
      },
    });

    return actionSuccess(rows.map(serializeFamilyField));
  } catch (error) {
    console.error("listFamilyFields failed:", error);
    return actionError(getPrismaErrorMessage(error, "field"));
  }
}
