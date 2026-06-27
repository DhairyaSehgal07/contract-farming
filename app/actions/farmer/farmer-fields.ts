"use server";

import prisma from "@/lib/prisma";
import { requireFarmerReadAction } from "@/lib/schemas/farmer/auth";
import {
  type CreateFarmerFieldInput,
  createFarmerFieldSchema,
  normalizeFarmerFieldInput,
  type UpdateFarmerFieldInput,
  updateFarmerFieldSchema,
} from "@/lib/schemas/farmer/farmer-field";
import {
  requireMasterWriteAction,
} from "@/lib/schemas/master/auth";
import {
  type ActionResult,
  actionError,
  actionSuccess,
} from "@/lib/schemas/master/action-result";
import { getPrismaErrorMessage } from "@/lib/schemas/master/prisma-errors";

export type FarmerFieldRow = {
  id: string;
  farmerId: string;
  name: string;
  geoLocation: string;
  acres: string;
  createdAt: string;
  updatedAt: string;
};

function serializeFarmerField(row: {
  id: string;
  farmerId: string;
  name: string;
  geoLocation: string;
  acres: { toString(): string };
  createdAt: Date;
  updatedAt: Date;
}): FarmerFieldRow {
  return {
    id: row.id,
    farmerId: row.farmerId,
    name: row.name,
    geoLocation: row.geoLocation,
    acres: row.acres.toString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listFarmerFields(
  farmerId: string,
): Promise<ActionResult<FarmerFieldRow[]>> {
  const authError = await requireFarmerReadAction();
  if (authError) return authError;

  if (!farmerId) {
    return actionError("Farmer is required.");
  }

  try {
    const rows = await prisma.farmerField.findMany({
      where: { farmerId },
      orderBy: [{ name: "asc" }],
    });

    return actionSuccess(rows.map(serializeFarmerField));
  } catch (error) {
    console.error("listFarmerFields failed:", error);
    return actionError(getPrismaErrorMessage(error, "field"));
  }
}

export async function createFarmerField(
  input: CreateFarmerFieldInput,
): Promise<ActionResult<FarmerFieldRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = createFarmerFieldSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const data = normalizeFarmerFieldInput(parsed.data);

  try {
    const farmer = await prisma.farmer.findUnique({
      where: { id: parsed.data.farmerId },
      select: { id: true },
    });

    if (!farmer) {
      return actionError("Farmer not found.");
    }

    const row = await prisma.farmerField.create({
      data: {
        farmerId: parsed.data.farmerId,
        name: data.name,
        geoLocation: data.geoLocation,
        acres: data.acres,
      },
    });

    return actionSuccess(serializeFarmerField(row));
  } catch (error) {
    console.error("createFarmerField failed:", error);
    return actionError(getPrismaErrorMessage(error, "field"));
  }
}

export async function updateFarmerField(
  input: UpdateFarmerFieldInput,
): Promise<ActionResult<FarmerFieldRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = updateFarmerFieldSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const data = normalizeFarmerFieldInput(parsed.data);

  try {
    const row = await prisma.farmerField.update({
      where: { id: parsed.data.id },
      data: {
        name: data.name,
        geoLocation: data.geoLocation,
        acres: data.acres,
      },
    });

    return actionSuccess(serializeFarmerField(row));
  } catch (error) {
    console.error("updateFarmerField failed:", error);
    return actionError(getPrismaErrorMessage(error, "field"));
  }
}

export async function deleteFarmerField(id: string): Promise<ActionResult> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  if (!id) {
    return actionError("ID is required.");
  }

  try {
    await prisma.farmerField.delete({ where: { id } });
    return actionSuccess(undefined);
  } catch (error) {
    console.error("deleteFarmerField failed:", error);
    return actionError(getPrismaErrorMessage(error, "field"));
  }
}
