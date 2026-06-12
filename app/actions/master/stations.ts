"use server";

import prisma from "@/lib/prisma";
import {
  type ActionResult,
  actionError,
  actionSuccess,
} from "@/lib/schemas/master/action-result";
import {
  requireMasterReadAction,
  requireMasterWriteAction,
} from "@/lib/schemas/master/auth";
import { getPrismaErrorMessage } from "@/lib/schemas/master/prisma-errors";
import {
  type CreateStationInput,
  createStationSchema,
  type UpdateStationInput,
  updateStationSchema,
} from "@/lib/schemas/master/station";

export type StationRow = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    localities: number;
    farmers: number;
  };
};

export async function listStations(): Promise<ActionResult<StationRow[]>> {
  const authError = await requireMasterReadAction();
  if (authError) return authError;

  try {
    const data = await prisma.station.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { localities: true, farmers: true },
        },
      },
    });
    return actionSuccess(data);
  } catch (error) {
    console.error("listStations failed:", error);
    return actionError(getPrismaErrorMessage(error, "station"));
  }
}

export async function createStation(
  input: CreateStationInput,
): Promise<ActionResult<StationRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = createStationSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  try {
    const data = await prisma.station.create({
      data: parsed.data,
      include: {
        _count: {
          select: { localities: true, farmers: true },
        },
      },
    });
    return actionSuccess(data);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "station"));
  }
}

export async function updateStation(
  input: UpdateStationInput,
): Promise<ActionResult<StationRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = updateStationSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  try {
    const data = await prisma.station.update({
      where: { id: parsed.data.id },
      data: { name: parsed.data.name },
      include: {
        _count: {
          select: { localities: true, farmers: true },
        },
      },
    });
    return actionSuccess(data);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "station"));
  }
}

export async function deleteStation(id: string): Promise<ActionResult> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  if (!id) {
    return actionError("ID is required.");
  }

  try {
    await prisma.station.delete({ where: { id } });
    return actionSuccess(undefined);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "station"));
  }
}
