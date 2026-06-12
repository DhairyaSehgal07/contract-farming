"use server";

import prisma from "@/lib/prisma";
import {
  type ActionResult,
  actionError,
  actionSuccess,
} from "@/lib/schemas/master/action-result";
import { requireMasterReadAction, requireMasterWriteAction } from "@/lib/schemas/master/auth";
import {
  type CreateLocalityInput,
  createLocalitySchema,
  normalizeLocalityInput,
  type UpdateLocalityInput,
  updateLocalitySchema,
} from "@/lib/schemas/master/locality";
import { getPrismaErrorMessage } from "@/lib/schemas/master/prisma-errors";

export type LocalityRow = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  stationId: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    farmers: number;
  };
};

export async function listLocalities(
  stationId: string,
): Promise<ActionResult<LocalityRow[]>> {
  const authError = await requireMasterReadAction();
  if (authError) return authError;

  if (!stationId) {
    return actionError("Station is required.");
  }

  try {
    const data = await prisma.locality.findMany({
      where: { stationId },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { farmers: true },
        },
      },
    });
    return actionSuccess(data);
  } catch (error) {
    console.error("listLocalities failed:", error);
    return actionError(getPrismaErrorMessage(error, "locality"));
  }
}

export async function createLocality(
  input: CreateLocalityInput,
): Promise<ActionResult<LocalityRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = createLocalitySchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const data = normalizeLocalityInput(parsed.data);

  try {
    const station = await prisma.station.findUnique({
      where: { id: data.stationId },
    });
    if (!station) {
      return actionError("Station not found.");
    }

    const locality = await prisma.locality.create({
      data,
      include: {
        _count: {
          select: { farmers: true },
        },
      },
    });
    return actionSuccess(locality);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "locality"));
  }
}

export async function updateLocality(
  input: UpdateLocalityInput,
): Promise<ActionResult<LocalityRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = updateLocalitySchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const data = normalizeLocalityInput(parsed.data);

  try {
    const locality = await prisma.locality.update({
      where: { id: data.id },
      data: {
        name: data.name,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        stationId: data.stationId,
      },
      include: {
        _count: {
          select: { farmers: true },
        },
      },
    });
    return actionSuccess(locality);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "locality"));
  }
}

export async function deleteLocality(id: string): Promise<ActionResult> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  if (!id) {
    return actionError("ID is required.");
  }

  try {
    await prisma.locality.delete({ where: { id } });
    return actionSuccess(undefined);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "locality"));
  }
}
