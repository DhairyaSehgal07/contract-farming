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
import {
  type CreateLocationInput,
  createLocationSchema,
  type UpdateLocationInput,
  updateLocationSchema,
} from "@/lib/schemas/master/location";
import { getPrismaErrorMessage } from "@/lib/schemas/master/prisma-errors";

export type LocationRow = {
  id: string;
  name: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function listLocations(): Promise<ActionResult<LocationRow[]>> {
  const authError = await requireMasterReadAction();
  if (authError) return authError;

  try {
    const data = await prisma.location.findMany({
      orderBy: { name: "asc" },
    });
    return actionSuccess(data);
  } catch (error) {
    console.error("listLocations failed:", error);
    return actionError(getPrismaErrorMessage(error, "location"));
  }
}

export async function createLocation(
  input: CreateLocationInput,
): Promise<ActionResult<LocationRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = createLocationSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  try {
    const data = await prisma.location.create({ data: parsed.data });
    return actionSuccess(data);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "location"));
  }
}

export async function updateLocation(
  input: UpdateLocationInput,
): Promise<ActionResult<LocationRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = updateLocationSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  try {
    const data = await prisma.location.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        category: parsed.data.category,
      },
    });
    return actionSuccess(data);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "location"));
  }
}

export async function deleteLocation(id: string): Promise<ActionResult> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  if (!id) {
    return actionError("ID is required.");
  }

  try {
    await prisma.location.delete({ where: { id } });
    return actionSuccess(undefined);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "location"));
  }
}
