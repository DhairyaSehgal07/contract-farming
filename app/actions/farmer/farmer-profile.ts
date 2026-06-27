"use server";

import type { RequisitionRow } from "@/app/actions/requisition/requisitions";
import {
  DispatchLotStatus,
  DispatchStatus,
} from "@/app/generated/prisma/client";
import type { RequisitionStatus } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";
import {
  type ActionResult,
  actionError,
  actionSuccess,
} from "@/lib/schemas/master/action-result";
import { getPrismaErrorMessage } from "@/lib/schemas/master/prisma-errors";
import { requireFarmerReadAction } from "@/lib/schemas/farmer/auth";

const farmerRequisitionInclude = {
  farmer: { select: { name: true, accountNumber: true } },
  variety: { select: { name: true } },
  createdBy: { select: { name: true } },
  reviewedBy: { select: { name: true } },
} as const;

type FarmerRequisitionWithRelations = Awaited<
  ReturnType<
    typeof prisma.requisition.findMany<{
      include: typeof farmerRequisitionInclude;
    }>
  >
>[number];

const farmerDispatchInclude = {
  location: { select: { name: true } },
  requisitions: {
    include: {
      requisition: {
        include: {
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

type FarmerDispatchWithRelations = Awaited<
  ReturnType<
    typeof prisma.dispatch.findMany<{
      include: typeof farmerDispatchInclude;
    }>
  >
>[number];

const farmerReceivedLotInclude = {
  receivedBy: { select: { name: true } },
  dispatchRequisition: {
    include: {
      dispatch: { select: { id: true, dispatchDate: true } },
      requisition: {
        include: {
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

type FarmerReceivedLotWithRelations = Awaited<
  ReturnType<
    typeof prisma.dispatchLot.findMany<{
      include: typeof farmerReceivedLotInclude;
    }>
  >
>[number];

export type FarmerDispatchRow = {
  dispatchId: string;
  dispatchDate: string | null;
  status: DispatchStatus;
  location: { name: string } | null;
  variety: { name: string };
  lotStatus: "PENDING" | "RECEIVED";
  receivedAt: string | null;
  requisitionId: string;
};

export type FarmerReceivedLotRow = {
  id: string;
  dispatchId: string;
  dispatchDate: string | null;
  variety: { name: string };
  receivedAt: string;
  receivedBy: { name: string } | null;
  sizeLines: Array<{
    quantity: string;
    size: { name: string };
    generation: { name: string };
  }>;
  totalQuantity: string;
};

function serializeFarmerRequisition(
  row: FarmerRequisitionWithRelations,
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

function serializeFarmerDispatchRows(
  row: FarmerDispatchWithRelations,
  farmerId: string,
): FarmerDispatchRow[] {
  return row.requisitions
    .filter((assignment) => assignment.requisition.farmerId === farmerId)
    .map((assignment) => ({
      dispatchId: row.id,
      dispatchDate: row.dispatchDate?.toISOString().slice(0, 10) ?? null,
      status: row.status,
      location: row.location,
      variety: assignment.requisition.variety,
      lotStatus: assignment.lot?.status ?? "PENDING",
      receivedAt: assignment.lot?.receivedAt?.toISOString() ?? null,
      requisitionId: assignment.requisitionId,
    }));
}

function serializeFarmerReceivedLot(
  row: FarmerReceivedLotWithRelations,
): FarmerReceivedLotRow {
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
  };
}

export async function listFarmerRequisitions(
  farmerId: string,
): Promise<ActionResult<RequisitionRow[]>> {
  const authError = await requireFarmerReadAction();
  if (authError) return authError;

  if (!farmerId) {
    return actionError("Farmer is required.");
  }

  try {
    const rows = await prisma.requisition.findMany({
      where: { farmerId },
      orderBy: [{ requisitionDate: "desc" }, { createdAt: "desc" }],
      include: farmerRequisitionInclude,
    });

    return actionSuccess(rows.map(serializeFarmerRequisition));
  } catch (error) {
    console.error("listFarmerRequisitions failed:", error);
    return actionError(getPrismaErrorMessage(error, "requisition"));
  }
}

export async function listFarmerDispatches(
  farmerId: string,
): Promise<ActionResult<FarmerDispatchRow[]>> {
  const authError = await requireFarmerReadAction();
  if (authError) return authError;

  if (!farmerId) {
    return actionError("Farmer is required.");
  }

  try {
    const rows = await prisma.dispatch.findMany({
      where: {
        requisitions: {
          some: { requisition: { farmerId } },
        },
      },
      orderBy: [{ dispatchDate: "desc" }, { createdAt: "desc" }],
      include: farmerDispatchInclude,
    });

    return actionSuccess(
      rows.flatMap((row) => serializeFarmerDispatchRows(row, farmerId)),
    );
  } catch (error) {
    console.error("listFarmerDispatches failed:", error);
    return actionError(getPrismaErrorMessage(error, "dispatch"));
  }
}

export async function listFarmerReceivedLots(
  farmerId: string,
): Promise<ActionResult<FarmerReceivedLotRow[]>> {
  const authError = await requireFarmerReadAction();
  if (authError) return authError;

  if (!farmerId) {
    return actionError("Farmer is required.");
  }

  try {
    const rows = await prisma.dispatchLot.findMany({
      where: {
        status: DispatchLotStatus.RECEIVED,
        dispatchRequisition: {
          requisition: { farmerId },
        },
      },
      orderBy: { receivedAt: "desc" },
      include: farmerReceivedLotInclude,
    });

    return actionSuccess(rows.map(serializeFarmerReceivedLot));
  } catch (error) {
    console.error("listFarmerReceivedLots failed:", error);
    return actionError(getPrismaErrorMessage(error, "dispatch"));
  }
}
