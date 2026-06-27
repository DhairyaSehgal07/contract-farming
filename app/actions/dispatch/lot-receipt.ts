"use server";

import {
  DispatchLotStatus,
  DispatchStatus,
  RequisitionStatus,
} from "@/app/generated/prisma/client";
import type { Prisma } from "@/app/generated/prisma/client";
import {
  getLatestReceivedAt,
  shouldMarkRequisitionFulfilled,
  shouldRevertRequisitionToApproved,
} from "@/lib/dispatch/lot-status";
import prisma from "@/lib/prisma";
import { getOtpProvider } from "@/lib/services/otp";
import { creditFarmerStockFromLot } from "@/lib/transfer/stock-balance";

type TransactionClient = Prisma.TransactionClient;

export async function maybeMarkRequisitionFulfilled(
  tx: TransactionClient,
  requisitionId: string,
) {
  const [requisition, sizes] = await Promise.all([
    tx.requisition.findUnique({
      where: { id: requisitionId },
      select: {
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

  if (!requisition) {
    throw new Error("Requisition not found.");
  }

  const requisitionFields = {
    status: requisition.status,
    acres: requisition.acres?.toString() ?? null,
    initialQuantity: requisition.initialQuantity?.toString() ?? null,
    fulfilledQuantity: requisition.fulfilledQuantity.toString(),
    fulfilledAcres: requisition.fulfilledAcres.toString(),
  };

  if (!shouldMarkRequisitionFulfilled(requisitionFields, sizes)) {
    return;
  }

  await tx.requisition.update({
    where: { id: requisitionId },
    data: { status: RequisitionStatus.FULFILLED },
  });
}

export async function maybeRevertRequisitionFromFulfilled(
  tx: TransactionClient,
  requisitionId: string,
) {
  const [requisition, sizes] = await Promise.all([
    tx.requisition.findUnique({
      where: { id: requisitionId },
      select: {
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

  if (!requisition) {
    throw new Error("Requisition not found.");
  }

  const requisitionFields = {
    status: requisition.status,
    acres: requisition.acres?.toString() ?? null,
    initialQuantity: requisition.initialQuantity?.toString() ?? null,
    fulfilledQuantity: requisition.fulfilledQuantity.toString(),
    fulfilledAcres: requisition.fulfilledAcres.toString(),
  };

  if (!shouldRevertRequisitionToApproved(requisitionFields, sizes)) {
    return;
  }

  await tx.requisition.update({
    where: { id: requisitionId },
    data: { status: RequisitionStatus.APPROVED },
  });
}

export async function maybeCloseDispatch(
  tx: TransactionClient,
  dispatchId: string,
) {
  const dispatch = await tx.dispatch.findUnique({
    where: { id: dispatchId },
    select: {
      status: true,
      requisitions: {
        select: {
          lot: {
            select: {
              status: true,
              receivedAt: true,
            },
          },
        },
      },
    },
  });

  if (!dispatch || dispatch.status === DispatchStatus.CLOSED) {
    return;
  }

  const lots = dispatch.requisitions
    .map((item) => item.lot)
    .filter((lot): lot is NonNullable<typeof lot> => lot !== null);

  if (lots.length === 0) {
    return;
  }

  const pendingCount = lots.filter(
    (lot) => lot.status !== DispatchLotStatus.RECEIVED,
  ).length;

  if (pendingCount > 0) {
    return;
  }

  const dateOfReceiving = getLatestReceivedAt(
    lots.map((lot) => lot.receivedAt),
  );

  await tx.dispatch.update({
    where: { id: dispatchId },
    data: {
      status: DispatchStatus.CLOSED,
      dateOfReceiving,
    },
  });
}

export async function sendLotReceiptOtpForLot(lotId: string) {
  const lot = await prisma.dispatchLot.findUnique({
    where: { id: lotId },
    select: {
      id: true,
      status: true,
      dispatchRequisition: {
        select: {
          requisition: {
            select: {
              farmer: {
                select: { mobileNumber: true },
              },
            },
          },
          dispatch: {
            select: { status: true },
          },
        },
      },
    },
  });

  if (!lot) {
    throw new Error("Lot not found.");
  }

  if (lot.status !== DispatchLotStatus.PENDING) {
    throw new Error("This lot has already been received.");
  }

  if (lot.dispatchRequisition.dispatch.status !== DispatchStatus.OPEN) {
    throw new Error("This dispatch is already closed.");
  }

  const mobileNumber = lot.dispatchRequisition.requisition.farmer.mobileNumber;
  const provider = getOtpProvider();
  const result = await provider.sendOtp({
    purpose: "lot-receipt",
    referenceId: lot.id,
    mobileNumber,
  });

  await prisma.dispatchLot.update({
    where: { id: lot.id },
    data: { otpSentAt: new Date() },
  });

  return {
    mobileNumber,
    devOtp: result.devOtp,
  };
}

export async function confirmLotReceiptForLot(
  lotId: string,
  otp: string,
  receivedById: string,
) {
  await prisma.$transaction(async (tx) => {
    const lot = await tx.dispatchLot.findUnique({
      where: { id: lotId },
      select: {
        id: true,
        status: true,
        dispatchRequisition: {
          select: {
            dispatchId: true,
            requisition: {
              select: {
                farmer: {
                  select: { mobileNumber: true },
                },
              },
            },
            dispatch: {
              select: { status: true },
            },
          },
        },
      },
    });

    if (!lot) {
      throw new Error("Lot not found.");
    }

    if (lot.status !== DispatchLotStatus.PENDING) {
      throw new Error("This lot has already been received.");
    }

    if (lot.dispatchRequisition.dispatch.status !== DispatchStatus.OPEN) {
      throw new Error("This dispatch is already closed.");
    }

    const mobileNumber = lot.dispatchRequisition.requisition.farmer.mobileNumber;
    const provider = getOtpProvider();
    const verified = await provider.verifyOtp(
      {
        purpose: "lot-receipt",
        referenceId: lot.id,
        mobileNumber,
      },
      otp,
    );

    if (!verified) {
      throw new Error("Invalid or expired OTP.");
    }

    const receivedAt = new Date();

    await tx.dispatchLot.update({
      where: { id: lot.id },
      data: {
        status: DispatchLotStatus.RECEIVED,
        receivedAt,
        receivedById,
        otpVerifiedAt: receivedAt,
      },
    });

    await creditFarmerStockFromLot(tx, lot.id);

    await maybeCloseDispatch(tx, lot.dispatchRequisition.dispatchId);
  });
}
