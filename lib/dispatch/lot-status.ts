import type {
  DispatchLotStatus,
  DispatchStatus,
  RequisitionStatus,
} from "@/app/generated/prisma/client";
import {
  isDispatchableRequisition,
} from "@/lib/requisition/quantity";

type RequisitionQuantityFields = {
  acres: string | null;
  initialQuantity: string | null;
  fulfilledQuantity?: string | null;
  fulfilledAcres?: string | null;
};

type LotWithStatus = {
  status: DispatchLotStatus;
};

type DispatchForDelete = {
  status: DispatchStatus;
};

export function getDispatchReceiptProgress(lots: LotWithStatus[]) {
  const total = lots.length;
  const received = lots.filter((lot) => lot.status === "RECEIVED").length;

  return {
    received,
    total,
    isComplete: total > 0 && received === total,
  };
}

export function canDeleteDispatch(
  dispatch: DispatchForDelete,
  lots: LotWithStatus[],
) {
  if (dispatch.status === "CLOSED") {
    return {
      allowed: false,
      reason: "Closed dispatches cannot be deleted.",
    };
  }

  if (lots.some((lot) => lot.status === "RECEIVED")) {
    return {
      allowed: false,
      reason: "Dispatches with received lots cannot be deleted.",
    };
  }

  return { allowed: true as const };
}

export function shouldMarkRequisitionFulfilled(
  requisition: RequisitionQuantityFields & { status: RequisitionStatus },
  sizes: { id: string; bagsPerAcre: number | null }[],
) {
  if (requisition.status !== "APPROVED") {
    return false;
  }

  return !isDispatchableRequisition(requisition, sizes);
}

export function shouldRevertRequisitionToApproved(
  requisition: RequisitionQuantityFields & { status: RequisitionStatus },
  sizes: { id: string; bagsPerAcre: number | null }[],
) {
  if (requisition.status !== "FULFILLED") {
    return false;
  }

  return isDispatchableRequisition(requisition, sizes);
}

export function getLatestReceivedAt(receivedAtValues: Array<Date | null>) {
  const timestamps = receivedAtValues
    .filter((value): value is Date => value !== null)
    .map((value) => value.getTime());

  if (timestamps.length === 0) {
    return null;
  }

  return new Date(Math.max(...timestamps));
}
