"use server";

import prisma from "@/lib/prisma";
import {
  type ActionResult,
  actionError,
  actionSuccess,
} from "@/lib/schemas/master/action-result";
import { requireMasterReadAction, requireMasterWriteAction } from "@/lib/schemas/master/auth";
import {
  type CreateFarmerInput,
  createFarmerSchema,
  normalizeFarmerInput,
  type UpdateFarmerInput,
  updateFarmerSchema,
} from "@/lib/schemas/master/farmer";
import { getPrismaErrorMessage } from "@/lib/schemas/master/prisma-errors";

export type FarmerRow = {
  id: string;
  name: string;
  accountNumber: string;
  mobileNumber: string;
  aadharNumber: string;
  panCardNumber: string | null;
  bankAccountName: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankIfscCode: string | null;
  bankBranchName: string | null;
  contractUrl: string | null;
  stationId: string;
  localityId: string;
  createdAt: Date;
  updatedAt: Date;
  station: { name: string };
  locality: { name: string };
};

async function validateLocalityBelongsToStation(
  stationId: string,
  localityId: string,
) {
  const locality = await prisma.locality.findFirst({
    where: { id: localityId, stationId },
  });

  if (!locality) {
    return actionError("Selected locality does not belong to the station.");
  }

  return null;
}

export async function listFarmers(): Promise<ActionResult<FarmerRow[]>> {
  const authError = await requireMasterReadAction();
  if (authError) return authError;

  try {
    const data = await prisma.farmer.findMany({
      orderBy: { name: "asc" },
      include: {
        station: { select: { name: true } },
        locality: { select: { name: true } },
      },
    });
    return actionSuccess(data);
  } catch (error) {
    console.error("listFarmers failed:", error);
    return actionError(getPrismaErrorMessage(error, "farmer"));
  }
}

export async function getFarmer(id: string): Promise<ActionResult<FarmerRow>> {
  const authError = await requireMasterReadAction();
  if (authError) return authError;

  try {
    const data = await prisma.farmer.findUnique({
      where: { id },
      include: {
        station: { select: { name: true } },
        locality: { select: { name: true } },
      },
    });

    if (!data) {
      return actionError("Farmer not found.");
    }

    return actionSuccess(data);
  } catch {
    return actionError("Failed to load farmer.");
  }
}

export async function createFarmer(
  input: CreateFarmerInput,
): Promise<ActionResult<FarmerRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = createFarmerSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const data = normalizeFarmerInput(parsed.data);
  const localityError = await validateLocalityBelongsToStation(
    data.stationId,
    data.localityId,
  );
  if (localityError) return localityError;

  try {
    const farmer = await prisma.farmer.create({
      data,
      include: {
        station: { select: { name: true } },
        locality: { select: { name: true } },
      },
    });
    return actionSuccess(farmer);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "farmer"));
  }
}

export async function updateFarmer(
  input: UpdateFarmerInput,
): Promise<ActionResult<FarmerRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = updateFarmerSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const { id, ...rest } = normalizeFarmerInput(parsed.data);
  const localityError = await validateLocalityBelongsToStation(
    rest.stationId,
    rest.localityId,
  );
  if (localityError) return localityError;

  try {
    const farmer = await prisma.farmer.update({
      where: { id },
      data: rest,
      include: {
        station: { select: { name: true } },
        locality: { select: { name: true } },
      },
    });
    return actionSuccess(farmer);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "farmer"));
  }
}

export async function deleteFarmer(id: string): Promise<ActionResult> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  if (!id) {
    return actionError("ID is required.");
  }

  try {
    await prisma.farmer.delete({ where: { id } });
    return actionSuccess(undefined);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "farmer"));
  }
}
