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
  type CreateFarmerFamilyInput,
  createFarmerFamilySchema,
  type UpdateFarmerFamilyInput,
  updateFarmerFamilySchema,
} from "@/lib/schemas/master/farmer-family-form";
import { getPrismaErrorMessage } from "@/lib/schemas/master/prisma-errors";

const familyInclude = {
  station: { select: { name: true } },
  locality: { select: { name: true } },
  members: {
    select: { id: true, name: true, accountNumber: true },
    orderBy: { accountNumber: "asc" as const },
  },
  _count: { select: { members: true } },
} as const;

export type FarmerFamilyRow = {
  id: string;
  accountNumber: string;
  name: string;
  stationId: string;
  localityId: string;
  createdAt: Date;
  updatedAt: Date;
  station: { name: string };
  locality: { name: string };
  members: { id: string; name: string; accountNumber: string }[];
  _count: { members: number };
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

export async function listFarmerFamilyRecords(): Promise<
  ActionResult<FarmerFamilyRow[]>
> {
  const authError = await requireMasterReadAction();
  if (authError) return authError;

  try {
    const data = await prisma.farmerFamily.findMany({
      orderBy: { accountNumber: "asc" },
      include: familyInclude,
    });
    return actionSuccess(data);
  } catch (error) {
    console.error("listFarmerFamilyRecords failed:", error);
    return actionError("Failed to load farmer families.");
  }
}

export async function getFarmerFamily(
  id: string,
): Promise<ActionResult<FarmerFamilyRow>> {
  const authError = await requireMasterReadAction();
  if (authError) return authError;

  try {
    const data = await prisma.farmerFamily.findUnique({
      where: { id },
      include: familyInclude,
    });

    if (!data) {
      return actionError("Family not found.");
    }

    return actionSuccess(data);
  } catch {
    return actionError("Failed to load family.");
  }
}

export async function createFarmerFamily(
  input: CreateFarmerFamilyInput,
): Promise<ActionResult<FarmerFamilyRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = createFarmerFamilySchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const localityError = await validateLocalityBelongsToStation(
    parsed.data.stationId,
    parsed.data.localityId,
  );
  if (localityError) return localityError;

  try {
    const family = await prisma.farmerFamily.create({
      data: parsed.data,
      include: familyInclude,
    });
    return actionSuccess(family);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "farmer family"));
  }
}

export async function updateFarmerFamily(
  input: UpdateFarmerFamilyInput,
): Promise<ActionResult<FarmerFamilyRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = updateFarmerFamilySchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const localityError = await validateLocalityBelongsToStation(
    parsed.data.stationId,
    parsed.data.localityId,
  );
  if (localityError) return localityError;

  const existing = await prisma.farmerFamily.findUnique({
    where: { id: parsed.data.id },
    include: { _count: { select: { members: true } } },
  });

  if (!existing) {
    return actionError("Family not found.");
  }

  if (
    existing._count.members > 0 &&
    parsed.data.accountNumber !== existing.accountNumber
  ) {
    return actionError(
      "Cannot change the family account number while members are linked.",
    );
  }

  const { id, ...data } = parsed.data;

  try {
    const family = await prisma.farmerFamily.update({
      where: { id },
      data,
      include: familyInclude,
    });
    return actionSuccess(family);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "farmer family"));
  }
}

export async function deleteFarmerFamily(id: string): Promise<ActionResult> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  if (!id) {
    return actionError("ID is required.");
  }

  try {
    const existing = await prisma.farmerFamily.findUnique({
      where: { id },
      include: { _count: { select: { members: true } } },
    });

    if (!existing) {
      return actionError("Family not found.");
    }

    if (existing._count.members > 0) {
      return actionError(
        "Cannot delete a family with linked members. Remove or reassign members first.",
      );
    }

    await prisma.farmerFamily.delete({ where: { id } });
    return actionSuccess(undefined);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "farmer family"));
  }
}
