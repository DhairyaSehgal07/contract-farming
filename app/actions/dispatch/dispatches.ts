"use server";

import type { RequisitionRow } from "@/app/actions/requisition/requisitions";
import {
  confirmLotReceiptForLot,
  maybeMarkRequisitionFulfilled,
  maybeRevertRequisitionFromFulfilled,
  sendLotReceiptOtpForLot,
} from "@/app/actions/dispatch/lot-receipt";
import {
  DispatchStatus,
  RequisitionStatus,
} from "@/app/generated/prisma/client";
import { getDispatchReceiptProgress, canDeleteDispatch } from "@/lib/dispatch/lot-status";
import prisma, { prismaInteractiveTxOptions } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/session";
import { requireDispatchReadAction, requireDispatchWriteAction } from "@/lib/schemas/dispatch/auth";
import {
  type ConfirmLotReceiptInput,
  confirmLotReceiptSchema,
  type CreateDispatchInput,
  createDispatchSchema,
  normalizeCreateDispatchInput,
  type SendLotReceiptOtpInput,
  sendLotReceiptOtpSchema,
  type UpdateDispatchBasicInput,
  type UpdateDispatchStep2Input,
  normalizeUpdateDispatchBasicInput,
  normalizeUpdateDispatchStep2Input,
  updateDispatchBasicSchema,
  updateDispatchStep2Schema,
} from "@/lib/schemas/dispatch/dispatch";
import {
  type ActionResult,
  actionError,
  actionSuccess,
} from "@/lib/schemas/master/action-result";
import { getPrismaErrorMessage } from "@/lib/schemas/master/prisma-errors";
import {
  calculateAcresFromBags,
  getRemainingAcres,
  getRemainingBagsForSize,
  getRemainingQuantityForRequisition,
  hasPendingDispatchQuantity,
  isAcresBasedRequisition,
  isBagsBasedRequisition,
} from "@/lib/requisition/quantity";

const dispatchInclude = {
  location: { select: { name: true } },
  _count: { select: { requisitions: true } },
  requisitions: {
    select: {
      lot: { select: { status: true } },
    },
  },
} as const;

const dispatchDetailInclude = {
  location: { select: { id: true, name: true } },
  requisitions: {
    include: {
      requisition: {
        include: {
          farmer: {
            select: {
              id: true,
              name: true,
              accountNumber: true,
              mobileNumber: true,
            },
          },
          variety: { select: { name: true } },
        },
      },
      sizeLines: {
        include: {
          size: { select: { id: true, name: true } },
          generation: { select: { id: true, name: true } },
        },
      },
      lot: {
        include: {
          receivedBy: { select: { name: true } },
        },
      },
    },
    orderBy: { requisition: { farmer: { name: "asc" } } },
  },
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

type DispatchDetailWithRelations = NonNullable<
  Awaited<
    ReturnType<
      typeof prisma.dispatch.findUnique<{
        where: { id: string };
        include: typeof dispatchDetailInclude;
      }>
    >
  >
>;

export type DispatchRow = {
  id: string;
  status: DispatchStatus;
  dispatchDate: string | null;
  dateOfReceiving: string | null;
  truckNumber: string | null;
  manualGatePassNumber: string | null;
  weightSlipNumber: string | null;
  grossWeight: string | null;
  tareWeight: string | null;
  netWeight: string | null;
  averageWeightPerBag: string | null;
  driverMobileNumber: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  locationId: string | null;
  location: { name: string } | null;
  toLocation: string | null;
  requisitionCount: number;
  lotsReceived: number;
  lotsTotal: number;
};

export type DispatchLotRow = {
  id: string;
  status: "PENDING" | "RECEIVED";
  receivedAt: string | null;
  otpSentAt: string | null;
  otpVerifiedAt: string | null;
  receivedBy: { name: string } | null;
  farmer: {
    id: string;
    name: string;
    accountNumber: string;
    mobileNumber: string;
  };
  variety: { name: string };
  requisitionId: string;
  sizeLines: Array<{
    id: string;
    quantity: string;
    size: { id: string; name: string };
    generation: { id: string; name: string };
  }>;
  totalQuantity: string;
};

export type DispatchDetail = DispatchRow & {
  requisitions: DispatchLotRow[];
};

export type DispatchableRequisitionRow = RequisitionRow & {
  orderBasis: "acres" | "bags";
  fulfilledQuantity: string;
  fulfilledAcres: string;
  remainingQuantity: string | null;
};

function serializeDispatch(row: DispatchWithRelations): DispatchRow {
  const lots = row.requisitions
    .map((item) => item.lot)
    .filter((lot): lot is NonNullable<typeof lot> => lot !== null);
  const progress = getDispatchReceiptProgress(lots);

  return {
    id: row.id,
    status: row.status,
    dispatchDate: row.dispatchDate?.toISOString().slice(0, 10) ?? null,
    dateOfReceiving: row.dateOfReceiving?.toISOString().slice(0, 10) ?? null,
    truckNumber: row.truckNumber,
    manualGatePassNumber: row.manualGatePassNumber,
    weightSlipNumber: row.weightSlipNumber,
    grossWeight: row.grossWeight?.toString() ?? null,
    tareWeight: row.tareWeight?.toString() ?? null,
    netWeight: row.netWeight?.toString() ?? null,
    averageWeightPerBag: row.averageWeightPerBag?.toString() ?? null,
    driverMobileNumber: row.driverMobileNumber,
    remarks: row.remarks,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    locationId: row.locationId,
    location: row.location,
    toLocation: row.toLocation,
    requisitionCount: row._count.requisitions,
    lotsReceived: progress.received,
    lotsTotal: progress.total,
  };
}

function serializeDispatchLot(
  assignment: DispatchDetailWithRelations["requisitions"][number],
): DispatchLotRow | null {
  if (!assignment.lot) {
    return null;
  }

  const totalQuantity = assignment.sizeLines.reduce(
    (sum, line) => sum + Number.parseFloat(line.quantity.toString()),
    0,
  );

  return {
    id: assignment.lot.id,
    status: assignment.lot.status,
    receivedAt: assignment.lot.receivedAt?.toISOString() ?? null,
    otpSentAt: assignment.lot.otpSentAt?.toISOString() ?? null,
    otpVerifiedAt: assignment.lot.otpVerifiedAt?.toISOString() ?? null,
    receivedBy: assignment.lot.receivedBy,
    farmer: assignment.requisition.farmer,
    variety: assignment.requisition.variety,
    requisitionId: assignment.requisitionId,
    sizeLines: assignment.sizeLines.map((line) => ({
      id: line.id,
      quantity: line.quantity.toString(),
      size: line.size,
      generation: line.generation,
    })),
    totalQuantity: totalQuantity.toString(),
  };
}

function serializeDispatchDetail(row: DispatchDetailWithRelations): DispatchDetail {
  const base = serializeDispatch({
    ...row,
    _count: { requisitions: row.requisitions.length },
    requisitions: row.requisitions.map((item) => ({
      lot: item.lot ? { status: item.lot.status } : null,
    })),
  });

  return {
    ...base,
    requisitions: row.requisitions
      .map(serializeDispatchLot)
      .filter((lot): lot is DispatchLotRow => lot !== null),
  };
}

function serializeDispatchableRequisition(
  row: DispatchableRequisitionWithRelations,
  sizes: { id: string; bagsPerAcre: number | null }[],
): DispatchableRequisitionRow | null {
  const requisitionFields = {
    acres: row.acres?.toString() ?? null,
    initialQuantity: row.initialQuantity?.toString() ?? null,
    fulfilledQuantity: row.fulfilledQuantity.toString(),
    fulfilledAcres: row.fulfilledAcres.toString(),
  };

  if (!hasPendingDispatchQuantity(requisitionFields, sizes)) {
    return null;
  }

  const orderBasis = isBagsBasedRequisition(requisitionFields) ? "bags" : "acres";
  const remainingQuantity = getRemainingQuantityForRequisition(requisitionFields);

  return {
    id: row.id,
    requisitionDate: row.requisitionDate.toISOString().slice(0, 10),
    requestedDeliveryDate: row.requestedDeliveryDate.toISOString().slice(0, 10),
    acres: row.acres?.toString() ?? null,
    initialQuantity: row.initialQuantity?.toString() ?? null,
    orderBasis,
    fulfilledQuantity: row.fulfilledQuantity.toString(),
    fulfilledAcres: row.fulfilledAcres.toString(),
    remainingQuantity,
    status: row.status,
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

export async function getDispatch(
  id: string,
): Promise<ActionResult<DispatchDetail>> {
  const authError = await requireDispatchReadAction();
  if (authError) return authError;

  if (!id) {
    return actionError("ID is required.");
  }

  try {
    const row = await prisma.dispatch.findUnique({
      where: { id },
      include: dispatchDetailInclude,
    });

    if (!row) {
      return actionError("Dispatch not found.");
    }

    return actionSuccess(serializeDispatchDetail(row));
  } catch (error) {
    console.error("getDispatch failed:", error);
    return actionError(getPrismaErrorMessage(error, "dispatch"));
  }
}

export type SendLotReceiptOtpResult = {
  mobileNumber: string;
  devOtp?: string;
};

export async function sendLotReceiptOtp(
  input: SendLotReceiptOtpInput,
): Promise<ActionResult<SendLotReceiptOtpResult>> {
  const authError = await requireDispatchWriteAction();
  if (authError) return authError;

  const parsed = sendLotReceiptOtpSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  try {
    const result = await sendLotReceiptOtpForLot(parsed.data.lotId);
    return actionSuccess(result);
  } catch (error) {
    if (error instanceof Error && error.message) {
      return actionError(error.message);
    }
    console.error("sendLotReceiptOtp failed:", error);
    return actionError(getPrismaErrorMessage(error, "dispatch"));
  }
}

export async function confirmLotReceipt(
  input: ConfirmLotReceiptInput,
): Promise<ActionResult<DispatchDetail>> {
  const authError = await requireDispatchWriteAction();
  if (authError) return authError;

  const parsed = confirmLotReceiptSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const session = await getServerSession();
  if (!session) {
    return actionError("You must be signed in.");
  }

  try {
    const lot = await prisma.dispatchLot.findUnique({
      where: { id: parsed.data.lotId },
      select: {
        dispatchRequisition: {
          select: { dispatchId: true },
        },
      },
    });

    if (!lot) {
      return actionError("Lot not found.");
    }

    await confirmLotReceiptForLot(
      parsed.data.lotId,
      parsed.data.otp,
      session.user.id,
    );

    const updated = await prisma.dispatch.findUnique({
      where: { id: lot.dispatchRequisition.dispatchId },
      include: dispatchDetailInclude,
    });

    if (!updated) {
      return actionError("Dispatch not found.");
    }

    return actionSuccess(serializeDispatchDetail(updated));
  } catch (error) {
    if (error instanceof Error && error.message) {
      return actionError(error.message);
    }
    console.error("confirmLotReceipt failed:", error);
    return actionError(getPrismaErrorMessage(error, "dispatch"));
  }
}

export async function listDispatchableRequisitions(): Promise<
  ActionResult<DispatchableRequisitionRow[]>
> {
  const authError = await requireDispatchReadAction();
  if (authError) return authError;

  try {
    const [rows, sizes] = await Promise.all([
      prisma.requisition.findMany({
        where: { status: RequisitionStatus.APPROVED },
        orderBy: [{ requisitionDate: "desc" }, { createdAt: "desc" }],
        include: dispatchableRequisitionInclude,
      }),
      prisma.size.findMany({
        select: { id: true, bagsPerAcre: true },
      }),
    ]);

    const dispatchable = rows
      .map((row) => serializeDispatchableRequisition(row, sizes))
      .filter((row): row is DispatchableRequisitionRow => row !== null);

    return actionSuccess(dispatchable);
  } catch (error) {
    console.error("listDispatchableRequisitions failed:", error);
    return actionError(getPrismaErrorMessage(error, "requisition"));
  }
}

export type DispatchFormOptions = {
  sizes: { id: string; name: string; bagsPerAcre: number | null }[];
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
        select: { id: true, name: true, bagsPerAcre: true },
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
      const requisitionIds = data.requisitions.map(
        (selection) => selection.requisitionId,
      );

      const [requisitions, sizes] = await Promise.all([
        tx.requisition.findMany({
          where: { id: { in: requisitionIds } },
          select: {
            id: true,
            status: true,
            acres: true,
            initialQuantity: true,
            fulfilledQuantity: true,
            fulfilledAcres: true,
          },
        }),
        tx.size.findMany({
          select: { id: true, bagsPerAcre: true },
        }),
      ]);

      const requisitionById = new Map(
        requisitions.map((requisition) => [requisition.id, requisition]),
      );
      const sizeById = new Map(sizes.map((size) => [size.id, size]));

      for (const selection of data.requisitions) {
        const requisition = requisitionById.get(selection.requisitionId);

        if (!requisition) {
          throw new Error("Requisition not found.");
        }

        if (requisition.status !== RequisitionStatus.APPROVED) {
          throw new Error("Only approved requisitions can be dispatched.");
        }

        const requisitionFields = {
          acres: requisition.acres?.toString() ?? null,
          initialQuantity: requisition.initialQuantity?.toString() ?? null,
          fulfilledQuantity: requisition.fulfilledQuantity.toString(),
          fulfilledAcres: requisition.fulfilledAcres.toString(),
        };

        const dispatchTotal = selection.sizeLines.reduce(
          (sum, line) => sum + line.quantity,
          0,
        );

        if (dispatchTotal <= 0) {
          throw new Error("Each requisition must have a positive quantity.");
        }

        if (isBagsBasedRequisition(requisitionFields)) {
          const size = { bagsPerAcre: null };
          const remaining = getRemainingBagsForSize(requisitionFields, size);
          if (remaining === null || dispatchTotal > remaining) {
            throw new Error(
              "Dispatch quantity exceeds remaining requisition quantity.",
            );
          }
          continue;
        }

        if (!isAcresBasedRequisition(requisitionFields)) {
          throw new Error(
            "Requisition must specify either acres or bags before dispatch.",
          );
        }

        if (selection.sizeLines.length !== 1) {
          throw new Error(
            "Acres-based requisitions must be dispatched with exactly one size.",
          );
        }

        const line = selection.sizeLines[0]!;
        const size = sizeById.get(line.sizeId);

        if (!size) {
          throw new Error("Size not found.");
        }

        if (size.bagsPerAcre == null || size.bagsPerAcre <= 0) {
          throw new Error(
            "Selected size does not have a bags-per-acre standard.",
          );
        }

        const remainingAcres = getRemainingAcres(requisitionFields);
        if (remainingAcres === null || remainingAcres <= 0) {
          throw new Error(
            "Dispatch quantity exceeds remaining requisition quantity.",
          );
        }

        const remainingBags = getRemainingBagsForSize(requisitionFields, size);
        if (remainingBags === null || line.quantity > remainingBags) {
          throw new Error(
            "Dispatch quantity exceeds remaining requisition quantity.",
          );
        }

        const acresConsumed = calculateAcresFromBags(
          line.quantity,
          size.bagsPerAcre,
        );
        if (acresConsumed === null || acresConsumed > remainingAcres) {
          throw new Error(
            "Dispatch quantity exceeds remaining requisition acres.",
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
          weightSlipNumber: data.weightSlipNumber ?? null,
          driverMobileNumber: data.driverMobileNumber ?? null,
          grossWeight: data.grossWeight ?? null,
          tareWeight: data.tareWeight ?? null,
          netWeight: data.netWeight ?? null,
          averageWeightPerBag: data.averageWeightPerBag ?? null,
          remarks: data.remarks ?? null,
          locationId: data.locationId ?? null,
          toLocation: data.toLocation ?? null,
          requisitions: {
            create: data.requisitions.map((selection) => ({
              requisitionId: selection.requisitionId,
              sizeLines: {
                create: selection.sizeLines.map((line) => ({
                  sizeId: line.sizeId,
                  generationId: line.generationId,
                  quantity: line.quantity,
                })),
              },
              lot: {
                create: {},
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

        let acresIncrement = 0;
        if (selection.sizeLines.length === 1) {
          const line = selection.sizeLines[0]!;
          const size = sizeById.get(line.sizeId);
          if (size?.bagsPerAcre) {
            const consumed = calculateAcresFromBags(
              line.quantity,
              size.bagsPerAcre,
            );
            if (consumed !== null) {
              acresIncrement = consumed;
            }
          }
        }

        await tx.requisition.update({
          where: { id: selection.requisitionId },
          data: {
            fulfilledQuantity: {
              increment: dispatchTotal,
            },
            ...(acresIncrement > 0
              ? { fulfilledAcres: { increment: acresIncrement } }
              : {}),
          },
        });

        await maybeMarkRequisitionFulfilled(
          tx,
          selection.requisitionId,
          sizes,
        );
      }

      return created;
    }, prismaInteractiveTxOptions);

    return actionSuccess(serializeDispatch(dispatch));
  } catch (error) {
    if (error instanceof Error && error.message) {
      return actionError(error.message);
    }
    console.error("createDispatch failed:", error);
    return actionError(getPrismaErrorMessage(error, "dispatch"));
  }
}

export async function updateDispatchBasic(
  input: UpdateDispatchBasicInput,
): Promise<ActionResult<DispatchRow>> {
  const authError = await requireDispatchWriteAction();
  if (authError) return authError;

  const parsed = updateDispatchBasicSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const { id, ...data } = normalizeUpdateDispatchBasicInput(parsed.data);

  try {
    const existing = await prisma.dispatch.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return actionError("Dispatch not found.");
    }

    const dispatch = await prisma.dispatch.update({
      where: { id },
      data: {
        dispatchDate: new Date(`${data.dispatchDate}T00:00:00.000Z`),
        locationId: data.locationId ?? null,
        toLocation: data.toLocation ?? null,
      },
      include: dispatchInclude,
    });

    return actionSuccess(serializeDispatch(dispatch));
  } catch (error) {
    if (error instanceof Error && error.message) {
      return actionError(error.message);
    }
    console.error("updateDispatchBasic failed:", error);
    return actionError(getPrismaErrorMessage(error, "dispatch"));
  }
}

export async function updateDispatchStep2(
  input: UpdateDispatchStep2Input,
): Promise<ActionResult<DispatchRow>> {
  const authError = await requireDispatchWriteAction();
  if (authError) return authError;

  const parsed = updateDispatchStep2Schema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const { id, ...data } = normalizeUpdateDispatchStep2Input(parsed.data);

  try {
    const existing = await prisma.dispatch.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!existing) {
      return actionError("Dispatch not found.");
    }

    if (existing.status === "CLOSED") {
      return actionError("Closed dispatches cannot be edited.");
    }

    const dispatch = await prisma.dispatch.update({
      where: { id },
      data: {
        dispatchDate: new Date(`${data.dispatchDate}T00:00:00.000Z`),
        truckNumber: data.truckNumber,
        manualGatePassNumber: data.manualGatePassNumber ?? null,
        weightSlipNumber: data.weightSlipNumber ?? null,
        driverMobileNumber: data.driverMobileNumber ?? null,
        grossWeight: data.grossWeight ?? null,
        tareWeight: data.tareWeight ?? null,
        netWeight: data.netWeight ?? null,
        averageWeightPerBag: data.averageWeightPerBag ?? null,
        remarks: data.remarks ?? null,
        locationId: data.locationId ?? null,
        toLocation: data.toLocation ?? null,
      },
      include: dispatchInclude,
    });

    return actionSuccess(serializeDispatch(dispatch));
  } catch (error) {
    if (error instanceof Error && error.message) {
      return actionError(error.message);
    }
    console.error("updateDispatchStep2 failed:", error);
    return actionError(getPrismaErrorMessage(error, "dispatch"));
  }
}

export async function deleteDispatch(id: string): Promise<ActionResult> {
  const authError = await requireDispatchWriteAction();
  if (authError) return authError;

  if (!id) {
    return actionError("ID is required.");
  }

  try {
    await prisma.$transaction(async (tx) => {
      const dispatch = await tx.dispatch.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          requisitions: {
            select: {
              requisitionId: true,
              sizeLines: {
                select: {
                  quantity: true,
                  size: { select: { bagsPerAcre: true } },
                },
              },
              lot: { select: { status: true } },
            },
          },
        },
      });

      if (!dispatch) {
        throw new Error("Dispatch not found.");
      }

      const lots = dispatch.requisitions
        .map((item) => item.lot)
        .filter((lot): lot is NonNullable<typeof lot> => lot !== null);
      const deleteCheck = canDeleteDispatch(dispatch, lots);

      if (!deleteCheck.allowed) {
        throw new Error(deleteCheck.reason);
      }

      const sizes = await tx.size.findMany({
        select: { id: true, bagsPerAcre: true },
      });

      for (const item of dispatch.requisitions) {
        const decrementBy = item.sizeLines.reduce(
          (sum, line) => sum + Number.parseFloat(line.quantity.toString()),
          0,
        );
        const acresDecrement = item.sizeLines.reduce((sum, line) => {
          const bagsPerAcre = line.size.bagsPerAcre;
          if (!bagsPerAcre || bagsPerAcre <= 0) return sum;
          const consumed = calculateAcresFromBags(
            Number.parseFloat(line.quantity.toString()),
            bagsPerAcre,
          );
          return consumed !== null ? sum + consumed : sum;
        }, 0);

        const requisition = await tx.requisition.findUnique({
          where: { id: item.requisitionId },
          select: { fulfilledQuantity: true, fulfilledAcres: true },
        });

        if (!requisition) {
          throw new Error("Requisition not found.");
        }

        const fulfilled = Number.parseFloat(requisition.fulfilledQuantity.toString());
        if (decrementBy > fulfilled) {
          throw new Error("Cannot reverse dispatch quantities for this requisition.");
        }

        const fulfilledAcres = Number.parseFloat(
          requisition.fulfilledAcres.toString(),
        );
        if (acresDecrement > fulfilledAcres) {
          throw new Error("Cannot reverse dispatch acres for this requisition.");
        }

        await tx.requisition.update({
          where: { id: item.requisitionId },
          data: {
            fulfilledQuantity: {
              decrement: decrementBy,
            },
            ...(acresDecrement > 0
              ? { fulfilledAcres: { decrement: acresDecrement } }
              : {}),
          },
        });

        await maybeRevertRequisitionFromFulfilled(
          tx,
          item.requisitionId,
          sizes,
        );
      }

      await tx.dispatch.delete({ where: { id: dispatch.id } });
    }, prismaInteractiveTxOptions);

    return actionSuccess(undefined);
  } catch (error) {
    if (error instanceof Error && error.message) {
      return actionError(error.message);
    }
    console.error("deleteDispatch failed:", error);
    return actionError(getPrismaErrorMessage(error, "dispatch"));
  }
}
