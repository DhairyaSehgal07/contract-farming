"use server";

import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import {
  type ActionResult,
  actionError,
  actionSuccess,
} from "@/lib/schemas/master/action-result";
import { getPrismaErrorMessage } from "@/lib/schemas/master/prisma-errors";
import {
  requireTransferReadAction,
  requireTransferWriteAction,
} from "@/lib/schemas/transfer/auth";
import {
  type CreateStockTransferInput,
  createStockTransferSchema,
  normalizeCreateStockTransferInput,
} from "@/lib/schemas/transfer/stock-transfer";
import { applyTransferLines } from "@/lib/transfer/stock-balance";

const transferListInclude = {
  fromFarmer: { select: { id: true, name: true, accountNumber: true } },
  toFarmer: { select: { id: true, name: true, accountNumber: true } },
  createdBy: { select: { name: true } },
  lines: { select: { quantity: true } },
} as const;

const transferDetailInclude = {
  fromFarmer: { select: { id: true, name: true, accountNumber: true } },
  toFarmer: { select: { id: true, name: true, accountNumber: true } },
  createdBy: { select: { name: true } },
  lines: {
    include: {
      variety: { select: { id: true, name: true } },
      size: { select: { id: true, name: true } },
      generation: { select: { id: true, name: true } },
    },
    orderBy: [
      { variety: { name: "asc" as const } },
      { size: { name: "asc" as const } },
      { generation: { name: "asc" as const } },
    ],
  },
};

type TransferListRow = Awaited<
  ReturnType<
    typeof prisma.stockTransfer.findMany<{ include: typeof transferListInclude }>
  >
>[number];

type TransferDetailRow = NonNullable<
  Awaited<
    ReturnType<
      typeof prisma.stockTransfer.findUnique<{
        where: { id: string };
        include: typeof transferDetailInclude;
      }>
    >
  >
>;

export type StockTransferRow = {
  id: string;
  transferDate: string;
  remarks: string | null;
  fromFarmer: { id: string; name: string; accountNumber: string };
  toFarmer: { id: string; name: string; accountNumber: string };
  createdBy: { name: string };
  totalQuantity: string;
  createdAt: string;
};

export type FarmerStockRow = {
  varietyId: string;
  variety: { id: string; name: string };
  sizeId: string;
  size: { id: string; name: string };
  generationId: string;
  generation: { id: string; name: string };
  quantity: string;
};

export type TransferFarmerOption = {
  id: string;
  name: string;
  accountNumber: string;
};

export type StockTransferDetail = StockTransferRow & {
  lines: Array<{
    id: string;
    variety: { id: string; name: string };
    size: { id: string; name: string };
    generation: { id: string; name: string };
    quantity: string;
  }>;
};

function serializeTransferListRow(row: TransferListRow): StockTransferRow {
  const totalQuantity = row.lines.reduce((sum, line) => {
    return sum + Number.parseFloat(line.quantity.toString());
  }, 0);

  return {
    id: row.id,
    transferDate: row.transferDate.toISOString().slice(0, 10),
    remarks: row.remarks,
    fromFarmer: row.fromFarmer,
    toFarmer: row.toFarmer,
    createdBy: row.createdBy,
    totalQuantity: totalQuantity.toString(),
    createdAt: row.createdAt.toISOString(),
  };
}

function serializeTransferDetail(row: TransferDetailRow): StockTransferDetail {
  const totalQuantity = row.lines.reduce((sum, line) => {
    return sum + Number.parseFloat(line.quantity.toString());
  }, 0);

  return {
    id: row.id,
    transferDate: row.transferDate.toISOString().slice(0, 10),
    remarks: row.remarks,
    fromFarmer: row.fromFarmer,
    toFarmer: row.toFarmer,
    createdBy: row.createdBy,
    totalQuantity: totalQuantity.toString(),
    createdAt: row.createdAt.toISOString(),
    lines: row.lines.map((line) => ({
      id: line.id,
      variety: line.variety,
      size: line.size,
      generation: line.generation,
      quantity: line.quantity.toString(),
    })),
  };
}

export async function listStockTransfers(): Promise<
  ActionResult<StockTransferRow[]>
> {
  const authError = await requireTransferReadAction();
  if (authError) return authError;

  try {
    const rows = await prisma.stockTransfer.findMany({
      include: transferListInclude,
      orderBy: [{ transferDate: "desc" }, { createdAt: "desc" }],
    });

    return actionSuccess(rows.map(serializeTransferListRow));
  } catch (error) {
    console.error("listStockTransfers failed:", error);
    return actionError(getPrismaErrorMessage(error, "transfer"));
  }
}

export async function getStockTransfer(
  id: string,
): Promise<ActionResult<StockTransferDetail>> {
  const authError = await requireTransferReadAction();
  if (authError) return authError;

  try {
    const row = await prisma.stockTransfer.findUnique({
      where: { id },
      include: transferDetailInclude,
    });

    if (!row) {
      return actionError("Transfer not found.");
    }

    return actionSuccess(serializeTransferDetail(row));
  } catch (error) {
    console.error("getStockTransfer failed:", error);
    return actionError(getPrismaErrorMessage(error, "transfer"));
  }
}

export async function listTransferableFarmers(): Promise<
  ActionResult<TransferFarmerOption[]>
> {
  const authError = await requireTransferReadAction();
  if (authError) return authError;

  try {
    const balances = await prisma.farmerStockBalance.findMany({
      where: { quantity: { gt: 0 } },
      select: { farmerId: true },
      distinct: ["farmerId"],
    });

    if (balances.length === 0) {
      return actionSuccess([]);
    }

    const farmers = await prisma.farmer.findMany({
      where: {
        id: { in: balances.map((balance) => balance.farmerId) },
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true, accountNumber: true },
    });

    return actionSuccess(farmers);
  } catch (error) {
    console.error("listTransferableFarmers failed:", error);
    return actionError(getPrismaErrorMessage(error, "transfer"));
  }
}

export async function listTransferDestinationFarmers(
  excludeFarmerId?: string,
): Promise<ActionResult<TransferFarmerOption[]>> {
  const authError = await requireTransferReadAction();
  if (authError) return authError;

  try {
    const farmers = await prisma.farmer.findMany({
      where: excludeFarmerId ? { id: { not: excludeFarmerId } } : undefined,
      orderBy: { name: "asc" },
      select: { id: true, name: true, accountNumber: true },
    });

    return actionSuccess(farmers);
  } catch (error) {
    console.error("listTransferDestinationFarmers failed:", error);
    return actionError(getPrismaErrorMessage(error, "transfer"));
  }
}

export async function listFarmerStock(
  farmerId: string,
): Promise<ActionResult<FarmerStockRow[]>> {
  const authError = await requireTransferReadAction();
  if (authError) return authError;

  if (!farmerId) {
    return actionError("Farmer is required.");
  }

  try {
    const rows = await prisma.farmerStockBalance.findMany({
      where: {
        farmerId,
        quantity: { gt: 0 },
      },
      include: {
        variety: { select: { id: true, name: true } },
        size: { select: { id: true, name: true } },
        generation: { select: { id: true, name: true } },
      },
      orderBy: [
        { variety: { name: "asc" } },
        { size: { name: "asc" } },
        { generation: { name: "asc" } },
      ],
    });

    return actionSuccess(
      rows.map((row) => ({
        varietyId: row.varietyId,
        variety: row.variety,
        sizeId: row.sizeId,
        size: row.size,
        generationId: row.generationId,
        generation: row.generation,
        quantity: row.quantity.toString(),
      })),
    );
  } catch (error) {
    console.error("listFarmerStock failed:", error);
    return actionError(getPrismaErrorMessage(error, "transfer"));
  }
}

export async function createStockTransfer(
  input: CreateStockTransferInput,
): Promise<ActionResult<StockTransferRow>> {
  const authError = await requireTransferWriteAction();
  if (authError) return authError;

  const session = await getServerSession();
  if (!session) {
    return actionError("You must be signed in to create a transfer.");
  }

  const parsed = createStockTransferSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const data = normalizeCreateStockTransferInput(parsed.data);

  if (data.lines.length === 0) {
    return actionError("At least one stock line is required.");
  }

  try {
    const transfer = await prisma.$transaction(async (tx) => {
      const [fromFarmer, toFarmer] = await Promise.all([
        tx.farmer.findUnique({
          where: { id: data.fromFarmerId },
          select: { id: true },
        }),
        tx.farmer.findUnique({
          where: { id: data.toFarmerId },
          select: { id: true },
        }),
      ]);

      if (!fromFarmer || !toFarmer) {
        throw new Error("Farmer not found.");
      }

      await applyTransferLines(
        tx,
        data.fromFarmerId,
        data.toFarmerId,
        data.lines,
      );

      return tx.stockTransfer.create({
        data: {
          transferDate: new Date(`${data.transferDate}T00:00:00.000Z`),
          remarks: data.remarks,
          fromFarmerId: data.fromFarmerId,
          toFarmerId: data.toFarmerId,
          createdById: session.user.id,
          lines: {
            create: data.lines.map((line) => ({
              varietyId: line.varietyId,
              sizeId: line.sizeId,
              generationId: line.generationId,
              quantity: line.quantity,
            })),
          },
        },
        include: transferListInclude,
      });
    });

    return actionSuccess(serializeTransferListRow(transfer));
  } catch (error) {
    console.error("createStockTransfer failed:", error);
    if (error instanceof Error && error.message) {
      return actionError(error.message);
    }
    return actionError(getPrismaErrorMessage(error, "transfer"));
  }
}
