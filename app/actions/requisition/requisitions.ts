"use server";

import { RequisitionStatus } from "@/app/generated/prisma/client";
import { getEffectiveRole } from "@/lib/auth/authorization";
import { MANAGING_DIRECTOR_ROLE } from "@/lib/auth/permission-catalog";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import {
  type ActionResult,
  actionError,
  actionSuccess,
} from "@/lib/schemas/master/action-result";
import { requireAuthAction } from "@/lib/schemas/master/auth";
import { getPrismaErrorMessage } from "@/lib/schemas/master/prisma-errors";
import {
  requireRequisitionApproveAction,
  requireRequisitionReadAction,
  requireRequisitionWriteAction,
} from "@/lib/schemas/requisition/auth";
import {
  type ApproveRequisitionInput,
  approveRequisitionSchema,
  type CreateRequisitionInput,
  createRequisitionSchema,
  normalizeRequisitionInput,
  type RejectRequisitionInput,
  rejectRequisitionSchema,
  type UpdateRequisitionInput,
  updateRequisitionSchema,
} from "@/lib/schemas/requisition/requisition";

const requisitionInclude = {
  farmer: { select: { name: true, accountNumber: true } },
  variety: { select: { name: true } },
  createdBy: { select: { name: true } },
  reviewedBy: { select: { name: true } },
} as const;

const requisitionDetailInclude = {
  ...requisitionInclude,
  dispatchAssignments: {
    include: {
      dispatch: {
        include: {
          generation: { select: { name: true } },
          location: { select: { name: true } },
        },
      },
      sizeLines: {
        include: { size: { select: { name: true } } },
      },
    },
    orderBy: { dispatch: { dispatchDate: "desc" } },
  },
} as const;

type RequisitionWithRelations = Awaited<
  ReturnType<
    typeof prisma.requisition.findMany<{ include: typeof requisitionInclude }>
  >
>[number];

type RequisitionDetailWithRelations = NonNullable<
  Awaited<
    ReturnType<
      typeof prisma.requisition.findUnique<{
        where: { id: string };
        include: typeof requisitionDetailInclude;
      }>
    >
  >
>;

export type RequisitionRow = {
  id: string;
  requisitionDate: string;
  requestedDeliveryDate: string;
  acres: string | null;
  initialQuantity: string | null;
  status: RequisitionStatus;
  rejectionRemarks: string | null;
  farmerId: string;
  varietyId: string;
  createdById: string;
  reviewedById: string | null;
  reviewedAt: string | null;
  approvalDate: string | null;
  rejectionDate: string | null;
  approvedDeliveryDate: string | null;
  createdAt: string;
  updatedAt: string;
  farmer: { name: string; accountNumber: string };
  variety: { name: string };
  createdBy: { name: string };
  reviewedBy: { name: string } | null;
};

export type RequisitionFarmerOption = {
  id: string;
  name: string;
  accountNumber: string;
};

export type RequisitionVarietyOption = {
  id: string;
  name: string;
};

export type RequisitionDispatchAssignment = {
  id: string;
  dispatch: {
    id: string;
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
    toLocation: string | null;
    generation: { name: string } | null;
    location: { name: string } | null;
  };
  sizeLines: Array<{
    id: string;
    quantity: string;
    size: { name: string };
  }>;
};

export type RequisitionDetail = RequisitionRow & {
  approvedDeliveryDate: string | null;
  fulfilledQuantity: string;
  remainingQuantity: string;
  dispatchAssignments: RequisitionDispatchAssignment[];
};

function serializeRequisition(row: RequisitionWithRelations): RequisitionRow {
  return {
    id: row.id,
    requisitionDate: row.requisitionDate.toISOString().slice(0, 10),
    requestedDeliveryDate: row.requestedDeliveryDate.toISOString().slice(0, 10),
    acres: row.acres?.toString() ?? null,
    initialQuantity: row.initialQuantity?.toString() ?? null,
    status: row.status,
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

function serializeDispatchAssignment(
  assignment: RequisitionDetailWithRelations["dispatchAssignments"][number],
): RequisitionDispatchAssignment {
  const { dispatch, sizeLines } = assignment;

  return {
    id: assignment.id,
    dispatch: {
      id: dispatch.id,
      dispatchDate: dispatch.dispatchDate?.toISOString().slice(0, 10) ?? null,
      dateOfReceiving:
        dispatch.dateOfReceiving?.toISOString().slice(0, 10) ?? null,
      truckNumber: dispatch.truckNumber,
      manualGatePassNumber: dispatch.manualGatePassNumber,
      weightSlipNumber: dispatch.weightSlipNumber,
      grossWeight: dispatch.grossWeight?.toString() ?? null,
      tareWeight: dispatch.tareWeight?.toString() ?? null,
      netWeight: dispatch.netWeight?.toString() ?? null,
      averageWeightPerBag: dispatch.averageWeightPerBag?.toString() ?? null,
      driverMobileNumber: dispatch.driverMobileNumber,
      remarks: dispatch.remarks,
      toLocation: dispatch.toLocation,
      generation: dispatch.generation,
      location: dispatch.location,
    },
    sizeLines: sizeLines.map((line) => ({
      id: line.id,
      quantity: line.quantity.toString(),
      size: line.size,
    })),
  };
}

function serializeRequisitionDetail(
  row: RequisitionDetailWithRelations,
): RequisitionDetail {
  const initial = row.initialQuantity
    ? Number.parseFloat(row.initialQuantity.toString())
    : 0;
  const fulfilled = Number.parseFloat(row.fulfilledQuantity.toString());
  const remaining = Math.max(0, initial - fulfilled);

  return {
    ...serializeRequisition(row),
    approvedDeliveryDate:
      row.approvedDeliveryDate?.toISOString().slice(0, 10) ?? null,
    fulfilledQuantity: row.fulfilledQuantity.toString(),
    remainingQuantity: remaining.toString(),
    dispatchAssignments: row.dispatchAssignments.map(serializeDispatchAssignment),
  };
}

async function getWritableRequisition(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const requisition = await prisma.requisition.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!requisition) {
    return actionError("Requisition not found.");
  }

  if (requisition.status !== RequisitionStatus.PENDING) {
    return actionError("Only pending requisitions can be changed.");
  }

  return actionSuccess({ id: requisition.id });
}

async function getApprovableRequisition(
  id: string,
  reviewerId: string,
  reviewerRole: ReturnType<typeof getEffectiveRole>,
): Promise<ActionResult<{ id: string }>> {
  const requisition = await prisma.requisition.findUnique({
    where: { id },
    select: { id: true, status: true, createdById: true },
  });

  if (!requisition) {
    return actionError("Requisition not found.");
  }

  if (requisition.status !== RequisitionStatus.PENDING) {
    return actionError(
      "Only pending requisitions can be approved or rejected.",
    );
  }

  if (
    requisition.createdById === reviewerId &&
    reviewerRole !== MANAGING_DIRECTOR_ROLE
  ) {
    return actionError("You cannot approve or reject your own requisition.");
  }

  return actionSuccess({ id: requisition.id });
}

export async function getRequisition(
  id: string,
): Promise<ActionResult<RequisitionDetail>> {
  const authError = await requireRequisitionReadAction();
  if (authError) return authError;

  if (!id) {
    return actionError("ID is required.");
  }

  try {
    const row = await prisma.requisition.findUnique({
      where: { id },
      include: requisitionDetailInclude,
    });

    if (!row) {
      return actionError("Requisition not found.");
    }

    return actionSuccess(serializeRequisitionDetail(row));
  } catch (error) {
    console.error("getRequisition failed:", error);
    return actionError(getPrismaErrorMessage(error, "requisition"));
  }
}

export async function listRequisitions(): Promise<
  ActionResult<RequisitionRow[]>
> {
  const authError = await requireRequisitionReadAction();
  if (authError) return authError;

  try {
    const rows = await prisma.requisition.findMany({
      orderBy: [{ requisitionDate: "desc" }, { createdAt: "desc" }],
      include: requisitionInclude,
    });

    return actionSuccess(rows.map(serializeRequisition));
  } catch (error) {
    console.error("listRequisitions failed:", error);
    return actionError(getPrismaErrorMessage(error, "requisition"));
  }
}

export async function listRequisitionFarmers(): Promise<
  ActionResult<RequisitionFarmerOption[]>
> {
  const authError = await requireRequisitionReadAction();
  if (authError) return authError;

  try {
    const data = await prisma.farmer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, accountNumber: true },
    });
    return actionSuccess(data);
  } catch {
    return actionError("Failed to load farmers.");
  }
}

export async function listRequisitionVarieties(): Promise<
  ActionResult<RequisitionVarietyOption[]>
> {
  const authError = await requireRequisitionReadAction();
  if (authError) return authError;

  try {
    const data = await prisma.variety.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return actionSuccess(data);
  } catch {
    return actionError("Failed to load varieties.");
  }
}

export async function createRequisition(
  input: CreateRequisitionInput,
): Promise<ActionResult<RequisitionRow>> {
  const authError = await requireRequisitionWriteAction();
  if (authError) return authError;

  const sessionError = await requireAuthAction();
  if (sessionError) return sessionError;

  const session = await getServerSession();
  if (!session) {
    return actionError("You must be signed in to perform this action.");
  }

  const parsed = createRequisitionSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const data = normalizeRequisitionInput(parsed.data);

  try {
    const requisition = await prisma.requisition.create({
      data: {
        requisitionDate: new Date(`${data.requisitionDate}T00:00:00.000Z`),
        requestedDeliveryDate: new Date(
          `${data.requestedDeliveryDate}T00:00:00.000Z`,
        ),
        acres: data.acres ?? null,
        initialQuantity: data.quantity ?? null,
        fulfilledQuantity: 0,
        farmerId: data.farmerId,
        varietyId: data.varietyId,
        createdById: session.user.id,
        status: RequisitionStatus.PENDING,
      },
      include: requisitionInclude,
    });

    return actionSuccess(serializeRequisition(requisition));
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "requisition"));
  }
}

export async function updateRequisition(
  input: UpdateRequisitionInput,
): Promise<ActionResult<RequisitionRow>> {
  const authError = await requireRequisitionWriteAction();
  if (authError) return authError;

  const parsed = updateRequisitionSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const { id, ...rest } = normalizeRequisitionInput(parsed.data);
  const existing = await getWritableRequisition(id);
  if (!existing.success) {
    return existing;
  }

  try {
    const requisition = await prisma.requisition.update({
      where: { id },
      data: {
        requisitionDate: new Date(`${rest.requisitionDate}T00:00:00.000Z`),
        requestedDeliveryDate: new Date(
          `${rest.requestedDeliveryDate}T00:00:00.000Z`,
        ),
        acres: rest.acres ?? null,
        initialQuantity: rest.quantity ?? null,
        farmerId: rest.farmerId,
        varietyId: rest.varietyId,
      },
      include: requisitionInclude,
    });

    return actionSuccess(serializeRequisition(requisition));
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "requisition"));
  }
}

export async function deleteRequisition(id: string): Promise<ActionResult> {
  const authError = await requireRequisitionWriteAction();
  if (authError) return authError;

  if (!id) {
    return actionError("ID is required.");
  }

  const existing = await getWritableRequisition(id);
  if (!existing.success) {
    return existing;
  }

  try {
    await prisma.requisition.delete({ where: { id } });
    return actionSuccess(undefined);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "requisition"));
  }
}

export async function approveRequisition(
  input: ApproveRequisitionInput,
): Promise<ActionResult<RequisitionRow>> {
  const authError = await requireRequisitionApproveAction();
  if (authError) return authError;

  const sessionError = await requireAuthAction();
  if (sessionError) return sessionError;

  const session = await getServerSession();
  if (!session) {
    return actionError("You must be signed in to perform this action.");
  }

  const parsed = approveRequisitionSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const { id, approvedDeliveryDate } = parsed.data;

  const role = getEffectiveRole(session);
  const existing = await getApprovableRequisition(id, session.user.id, role);
  if (!existing.success) {
    return existing;
  }

  try {
    const today = new Date();
    const approvalDate = new Date(
      `${today.toISOString().slice(0, 10)}T00:00:00.000Z`,
    );

    const requisition = await prisma.requisition.update({
      where: { id },
      data: {
        status: RequisitionStatus.APPROVED,
        reviewedById: session.user.id,
        reviewedAt: new Date(),
        approvalDate,
        approvedDeliveryDate: new Date(
          `${approvedDeliveryDate}T00:00:00.000Z`,
        ),
        rejectionDate: null,
        rejectionRemarks: null,
      },
      include: requisitionInclude,
    });

    return actionSuccess(serializeRequisition(requisition));
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "requisition"));
  }
}

export async function rejectRequisition(
  input: RejectRequisitionInput,
): Promise<ActionResult<RequisitionRow>> {
  const authError = await requireRequisitionApproveAction();
  if (authError) return authError;

  const sessionError = await requireAuthAction();
  if (sessionError) return sessionError;

  const session = await getServerSession();
  if (!session) {
    return actionError("You must be signed in to perform this action.");
  }

  const parsed = rejectRequisitionSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const { id, rejectionRemarks } = parsed.data;
  const role = getEffectiveRole(session);
  const existing = await getApprovableRequisition(id, session.user.id, role);
  if (!existing.success) {
    return existing;
  }

  try {
    const today = new Date();
    const rejectionDate = new Date(
      `${today.toISOString().slice(0, 10)}T00:00:00.000Z`,
    );

    const requisition = await prisma.requisition.update({
      where: { id },
      data: {
        status: RequisitionStatus.REJECTED,
        reviewedById: session.user.id,
        reviewedAt: new Date(),
        approvalDate: null,
        rejectionDate,
        rejectionRemarks,
      },
      include: requisitionInclude,
    });

    return actionSuccess(serializeRequisition(requisition));
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "requisition"));
  }
}
