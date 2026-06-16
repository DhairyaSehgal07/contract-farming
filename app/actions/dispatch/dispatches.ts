"use server";

import { RequisitionStatus } from "@/app/generated/prisma/client";
import type { RequisitionRow } from "@/app/actions/requisition/requisitions";
import prisma from "@/lib/prisma";
import { requireDispatchReadAction, requireDispatchWriteAction } from "@/lib/schemas/dispatch/auth";
import {
  type CreateDispatchInput,
  createDispatchSchema,
  normalizeCreateDispatchInput,
} from "@/lib/schemas/dispatch/dispatch";
import {
  type ActionResult,
  actionError,
  actionSuccess,
} from "@/lib/schemas/master/action-result";
import { getPrismaErrorMessage } from "@/lib/schemas/master/prisma-errors";

const dispatchInclude = {
  generation: { select: { name: true } },
  location: { select: { name: true } },
  toLocation: { select: { name: true } },
  _count: { select: { requisitions: true } },
} as const;

const dispatchableRequisitionInclude = {
  farmer: { select: { name: true, accountNumber: true } },
  variety: { select: { name: true } },
  createdBy: { select: { name: true } },
  reviewedBy: { select: { name: true } },
} as const;

type DispatchWithRelations = Awaited<
  ReturnType<
    typeof prisma.dispatch.findMany<{ include: typeof dispatchInclude }>
  >
>[number];

type DispatchableRequisitionWithRelations = Awaited<
  ReturnType<
    typeof prisma.requisition.findMany<{
      include: typeof dispatchableRequisitionInclude;
    }>
  >
>[number];

export type DispatchRow = {
  id: string;
  dispatchDate: string | null;
  dateOfReceiving: string | null;
  truckNumber: string | null;
  manualGatePassNumber: string | null;
  netWeight: string | null;
  driverMobileNumber: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  generation: { name: string } | null;
  location: { name: string } | null;
  toLocation: { name: string } | null;
  requisitionCount: number;
};

export type DispatchableRequisitionRow = RequisitionRow & {
  fulfilledQuantity: string;
  remainingQuantity: string;
};

function serializeDispatch(row: DispatchWithRelations): DispatchRow {
  return {
    id: row.id,
    dispatchDate: row.dispatchDate?.toISOString().slice(0, 10) ?? null,
    dateOfReceiving: row.dateOfReceiving?.toISOString().slice(0, 10) ?? null,
    truckNumber: row.truckNumber,
    manualGatePassNumber: row.manualGatePassNumber,
    netWeight: row.netWeight?.toString() ?? null,
    driverMobileNumber: row.driverMobileNumber,
    remarks: row.remarks,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    generation: row.generation,
    location: row.location,
    toLocation: row.toLocation,
    requisitionCount: row._count.requisitions,
  };
}

function serializeDispatchableRequisition(
  row: DispatchableRequisitionWithRelations,
): DispatchableRequisitionRow | null {
  const initial = row.initialQuantity ? Number.parseFloat(row.initialQuantity.toString()) : 0;
  const fulfilled = Number.parseFloat(row.fulfilledQuantity.toString());
  const remaining = initial - fulfilled;

  if (remaining <= 0) {
    return null;
  }

  return {
    id: row.id,
    requisitionDate: row.requisitionDate.toISOString().slice(0, 10),
    expectedDeliveryDate: row.expectedDeliveryDate.toISOString().slice(0, 10),
    acres: row.acres?.toString() ?? null,
    initialQuantity: row.initialQuantity?.toString() ?? null,
    fulfilledQuantity: row.fulfilledQuantity.toString(),
    remainingQuantity: remaining.toString(),
    status: row.status,
    rejectionRemarks: row.rejectionRemarks,
    farmerId: row.farmerId,
    varietyId: row.varietyId,
    createdById: row.createdById,
    reviewedById: row.reviewedById,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    farmer: row.farmer,
    variety: row.variety,
    createdBy: row.createdBy,
    reviewedBy: row.reviewedBy,
  };
}

export async function listDispatches(): Promise<ActionResult<DispatchRow[]>> {
  const authError = await requireDispatchReadAction();
  if (authError) return authError;

  try {
    const rows = await prisma.dispatch.findMany({
      orderBy: [{ dispatchDate: "desc" }, { createdAt: "desc" }],
      include: dispatchInclude,
    });

    return actionSuccess(rows.map(serializeDispatch));
  } catch (error) {
    console.error("listDispatches failed:", error);
    return actionError(getPrismaErrorMessage(error, "dispatch"));
  }
}

export async function listDispatchableRequisitions(): Promise<
  ActionResult<DispatchableRequisitionRow[]>
> {
  const authError = await requireDispatchReadAction();
  if (authError) return authError;

  try {
    const rows = await prisma.requisition.findMany({
      where: { status: RequisitionStatus.APPROVED },
      orderBy: [{ requisitionDate: "desc" }, { createdAt: "desc" }],
      include: dispatchableRequisitionInclude,
    });

    const dispatchable = rows
      .map(serializeDispatchableRequisition)
      .filter((row): row is DispatchableRequisitionRow => row !== null);

    return actionSuccess(dispatchable);
  } catch (error) {
    console.error("listDispatchableRequisitions failed:", error);
    return actionError(getPrismaErrorMessage(error, "requisition"));
  }
}

export type DispatchFormOptions = {
  sizes: { id: string; name: string }[];
  generations: { id: string; name: string }[];
  locations: { id: string; name: string; category: string }[];
};

export async function listDispatchFormOptions(): Promise<
  ActionResult<DispatchFormOptions>
> {
  const authError = await requireDispatchReadAction();
  if (authError) return authError;

  try {
    const [sizes, generations, locations] = await Promise.all([
      prisma.size.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
      prisma.generation.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
      prisma.location.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, category: true },
      }),
    ]);

    return actionSuccess({ sizes, generations, locations });
  } catch (error) {
    console.error("listDispatchFormOptions failed:", error);
    return actionError(getPrismaErrorMessage(error, "dispatch"));
  }
}

export async function createDispatch(
  input: CreateDispatchInput,
): Promise<ActionResult<DispatchRow>> {
  const authError = await requireDispatchWriteAction();
  if (authError) return authError;

  const parsed = createDispatchSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const data = normalizeCreateDispatchInput(parsed.data);

  try {
    const dispatch = await prisma.$transaction(async (tx) => {
      for (const selection of data.requisitions) {
        const requisition = await tx.requisition.findUnique({
          where: { id: selection.requisitionId },
          select: {
            id: true,
            status: true,
            initialQuantity: true,
            fulfilledQuantity: true,
          },
        });

        if (!requisition) {
          throw new Error("Requisition not found.");
        }

        if (requisition.status !== RequisitionStatus.APPROVED) {
          throw new Error("Only approved requisitions can be dispatched.");
        }

        const initial = requisition.initialQuantity
          ? Number.parseFloat(requisition.initialQuantity.toString())
          : 0;
        const fulfilled = Number.parseFloat(
          requisition.fulfilledQuantity.toString(),
        );
        const remaining = initial - fulfilled;
        const dispatchTotal = selection.sizeLines.reduce(
          (sum, line) => sum + line.quantity,
          0,
        );

        if (dispatchTotal <= 0) {
          throw new Error("Each requisition must have a positive quantity.");
        }

        if (dispatchTotal > remaining) {
          throw new Error(
            "Dispatch quantity exceeds remaining requisition quantity.",
          );
        }
      }

      const created = await tx.dispatch.create({
        data: {
          dispatchDate: new Date(`${data.dispatchDate}T00:00:00.000Z`),
          dateOfReceiving: data.dateOfReceiving
            ? new Date(`${data.dateOfReceiving}T00:00:00.000Z`)
            : null,
          truckNumber: data.truckNumber,
          manualGatePassNumber: data.manualGatePassNumber ?? null,
          driverMobileNumber: data.driverMobileNumber ?? null,
          grossWeight: data.grossWeight ?? null,
          tareWeight: data.tareWeight ?? null,
          netWeight: data.netWeight ?? null,
          averageWeightPerBag: data.averageWeightPerBag ?? null,
          remarks: data.remarks ?? null,
          generationId: data.generationId,
          locationId: data.locationId ?? null,
          toLocationId: data.toLocationId ?? null,
          requisitions: {
            create: data.requisitions.map((selection) => ({
              requisitionId: selection.requisitionId,
              sizeLines: {
                create: selection.sizeLines.map((line) => ({
                  sizeId: line.sizeId,
                  quantity: line.quantity,
                })),
              },
            })),
          },
        },
        include: dispatchInclude,
      });

      for (const selection of data.requisitions) {
        const dispatchTotal = selection.sizeLines.reduce(
          (sum, line) => sum + line.quantity,
          0,
        );

        await tx.requisition.update({
          where: { id: selection.requisitionId },
          data: {
            fulfilledQuantity: {
              increment: dispatchTotal,
            },
          },
        });
      }

      return created;
    });

    return actionSuccess(serializeDispatch(dispatch));
  } catch (error) {
    if (error instanceof Error && error.message) {
      return actionError(error.message);
    }
    console.error("createDispatch failed:", error);
    return actionError(getPrismaErrorMessage(error, "dispatch"));
  }
}
