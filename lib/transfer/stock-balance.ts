import type { Prisma } from "@/app/generated/prisma/client";

type TransactionClient = Prisma.TransactionClient;

export type StockLineKey = {
  varietyId: string;
  sizeId: string;
  generationId: string;
};

export type StockLineInput = StockLineKey & {
  quantity: number;
};

function stockLineKey(key: StockLineKey) {
  return `${key.varietyId}:${key.sizeId}:${key.generationId}`;
}

export function assertSufficientStock(
  balances: ReadonlyArray<{
    varietyId: string;
    sizeId: string;
    generationId: string;
    quantity: string | number | { toString(): string };
  }>,
  lines: ReadonlyArray<StockLineInput>,
) {
  const balanceMap = new Map<string, number>();
  for (const balance of balances) {
    const key = stockLineKey(balance);
    balanceMap.set(key, Number.parseFloat(balance.quantity.toString()));
  }

  for (const line of lines) {
    if (line.quantity <= 0) {
      throw new Error("Each transfer line must have a positive quantity.");
    }

    const available = balanceMap.get(stockLineKey(line)) ?? 0;
    if (line.quantity > available) {
      throw new Error("Transfer quantity exceeds available stock.");
    }
  }
}

async function incrementFarmerStock(
  tx: TransactionClient,
  farmerId: string,
  line: StockLineKey & { quantity: number },
  direction: 1 | -1,
) {
  const delta = direction * line.quantity;
  const existing = await tx.farmerStockBalance.findUnique({
    where: {
      farmerId_varietyId_sizeId_generationId: {
        farmerId,
        varietyId: line.varietyId,
        sizeId: line.sizeId,
        generationId: line.generationId,
      },
    },
    select: { id: true, quantity: true },
  });

  if (existing) {
    const nextQuantity =
      Number.parseFloat(existing.quantity.toString()) + delta;
    if (nextQuantity < 0) {
      throw new Error("Transfer quantity exceeds available stock.");
    }

    if (nextQuantity === 0) {
      await tx.farmerStockBalance.delete({ where: { id: existing.id } });
      return;
    }

    await tx.farmerStockBalance.update({
      where: { id: existing.id },
      data: { quantity: nextQuantity },
    });
    return;
  }

  if (delta < 0) {
    throw new Error("Transfer quantity exceeds available stock.");
  }

  await tx.farmerStockBalance.create({
    data: {
      farmerId,
      varietyId: line.varietyId,
      sizeId: line.sizeId,
      generationId: line.generationId,
      quantity: delta,
    },
  });
}

export async function creditFarmerStockFromLot(
  tx: TransactionClient,
  lotId: string,
) {
  const lot = await tx.dispatchLot.findUnique({
    where: { id: lotId },
    select: {
      status: true,
      dispatchRequisition: {
        select: {
          requisition: {
            select: {
              farmerId: true,
              varietyId: true,
            },
          },
          sizeLines: {
            select: {
              sizeId: true,
              generationId: true,
              quantity: true,
            },
          },
        },
      },
    },
  });

  if (!lot) {
    throw new Error("Lot not found.");
  }

  const { farmerId, varietyId } = lot.dispatchRequisition.requisition;

  for (const sizeLine of lot.dispatchRequisition.sizeLines) {
    const quantity = Number.parseFloat(sizeLine.quantity.toString());
    if (quantity <= 0) continue;

    await incrementFarmerStock(
      tx,
      farmerId,
      {
        varietyId,
        sizeId: sizeLine.sizeId,
        generationId: sizeLine.generationId,
        quantity,
      },
      1,
    );
  }
}

export async function applyTransferLines(
  tx: TransactionClient,
  fromFarmerId: string,
  toFarmerId: string,
  lines: ReadonlyArray<StockLineInput>,
) {
  const balances = await tx.farmerStockBalance.findMany({
    where: { farmerId: fromFarmerId },
    select: {
      varietyId: true,
      sizeId: true,
      generationId: true,
      quantity: true,
    },
  });

  assertSufficientStock(balances, lines);

  for (const line of lines) {
    await incrementFarmerStock(tx, fromFarmerId, line, -1);
    await incrementFarmerStock(tx, toFarmerId, line, 1);
  }
}
