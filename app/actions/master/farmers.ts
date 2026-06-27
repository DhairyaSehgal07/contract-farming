"use server";

import prisma from "@/lib/prisma";
import { inferFarmerKind } from "@/lib/master/farmer-family";
import {
  type ActionResult,
  actionError,
  actionSuccess,
} from "@/lib/schemas/master/action-result";
import { requireFarmerReadAction } from "@/lib/schemas/farmer/auth";
import {
  requireMasterReadAction,
  requireMasterWriteAction,
} from "@/lib/schemas/master/auth";
import {
  type CreateFarmerInput,
  createFarmerSchema,
  normalizeFarmerInput,
  type UpdateFarmerInput,
  updateFarmerSchema,
  validateFarmerKindWithFamilyAccount,
} from "@/lib/schemas/master/farmer";
import { getPrismaErrorMessage } from "@/lib/schemas/master/prisma-errors";

const farmerInclude = {
  station: { select: { name: true } },
  locality: { select: { name: true } },
  family: { select: { id: true, accountNumber: true, name: true } },
} as const;

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
  familyId: string | null;
  family: { id: string; accountNumber: string; name: string } | null;
  createdAt: Date;
  updatedAt: Date;
  station: { name: string };
  locality: { name: string };
};

export type FarmerFamilyOption = {
  id: string;
  accountNumber: string;
  name: string;
  memberCount: number;
  memberAccountNumbers: string[];
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

async function getFamilyForValidation(familyId?: string) {
  if (!familyId) return null;

  return prisma.farmerFamily.findUnique({
    where: { id: familyId },
    select: {
      id: true,
      accountNumber: true,
      name: true,
      members: { select: { id: true, accountNumber: true } },
    },
  });
}

function buildFarmerData(
  data: ReturnType<typeof normalizeFarmerInput<CreateFarmerInput>>,
  familyId: string | null,
) {
  const { farmerKind: _farmerKind, familyId: _familyId, ...rest } = data;
  return {
    ...rest,
    familyId,
  };
}

export async function listFarmers(): Promise<ActionResult<FarmerRow[]>> {
  const authError = await requireFarmerReadAction();
  if (authError) return authError;

  try {
    const data = await prisma.farmer.findMany({
      orderBy: { name: "asc" },
      include: farmerInclude,
    });
    return actionSuccess(data);
  } catch (error) {
    console.error("listFarmers failed:", error);
    return actionError(getPrismaErrorMessage(error, "farmer"));
  }
}

export async function listFarmerFamilies(): Promise<
  ActionResult<FarmerFamilyOption[]>
> {
  const authError = await requireMasterReadAction();
  if (authError) return authError;

  try {
    const families = await prisma.farmerFamily.findMany({
      orderBy: { accountNumber: "asc" },
      include: {
        _count: { select: { members: true } },
        members: { select: { accountNumber: true } },
      },
    });

    return actionSuccess(
      families.map((family) => ({
        id: family.id,
        accountNumber: family.accountNumber,
        name: family.name,
        memberCount: family._count.members,
        memberAccountNumbers: family.members.map(
          (member) => member.accountNumber,
        ),
      })),
    );
  } catch (error) {
    console.error("listFarmerFamilies failed:", error);
    return actionError("Failed to load farmer families.");
  }
}

export async function getFarmer(id: string): Promise<ActionResult<FarmerRow>> {
  const authError = await requireFarmerReadAction();
  if (authError) return authError;

  try {
    const data = await prisma.farmer.findUnique({
      where: { id },
      include: farmerInclude,
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

  const normalized = normalizeFarmerInput(parsed.data);
  const localityError = await validateLocalityBelongsToStation(
    normalized.stationId,
    normalized.localityId,
  );
  if (localityError) return localityError;

  const selectedFamily = await getFamilyForValidation(normalized.familyId);
  if (normalized.farmerKind === "family_member" && !selectedFamily) {
    return actionError("Selected family was not found.");
  }

  const kindValidation = validateFarmerKindWithFamilyAccount(
    parsed.data,
    selectedFamily?.accountNumber,
  );
  if (!kindValidation.success) {
    return actionError(
      kindValidation.error.issues[0]?.message ?? "Invalid input.",
    );
  }

  try {
    const farmer = await prisma.$transaction(async (tx) => {
      let familyId: string | null = null;

      if (normalized.farmerKind === "family_head") {
        const family = await tx.farmerFamily.create({
          data: {
            accountNumber: normalized.accountNumber,
            name: `${normalized.name} Family`,
            stationId: normalized.stationId,
            localityId: normalized.localityId,
          },
        });
        familyId = family.id;
      } else if (normalized.farmerKind === "family_member" && selectedFamily) {
        familyId = selectedFamily.id;
      }

      return tx.farmer.create({
        data: buildFarmerData(normalized, familyId),
        include: farmerInclude,
      });
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

  const normalized = normalizeFarmerInput(parsed.data);
  const localityError = await validateLocalityBelongsToStation(
    normalized.stationId,
    normalized.localityId,
  );
  if (localityError) return localityError;

  const existing = await prisma.farmer.findUnique({
    where: { id: parsed.data.id },
    include: {
      family: {
        select: {
          id: true,
          accountNumber: true,
          members: { select: { id: true } },
        },
      },
    },
  });

  if (!existing) {
    return actionError("Farmer not found.");
  }

  const selectedFamily = await getFamilyForValidation(normalized.familyId);
  if (normalized.farmerKind === "family_member" && !selectedFamily) {
    return actionError("Selected family was not found.");
  }

  const kindValidation = validateFarmerKindWithFamilyAccount(
    parsed.data,
    selectedFamily?.accountNumber ?? existing.family?.accountNumber,
  );
  if (!kindValidation.success) {
    return actionError(
      kindValidation.error.issues[0]?.message ?? "Invalid input.",
    );
  }

  const existingKind = inferFarmerKind({
    familyId: existing.familyId,
    accountNumber: existing.accountNumber,
    familyAccountNumber: existing.family?.accountNumber,
  });

  if (
    existingKind === "family_head" &&
    normalized.farmerKind !== "family_head" &&
    existing.family &&
    existing.family.members.length > 1
  ) {
    return actionError(
      "Cannot change the family primary account while other family members exist.",
    );
  }

  try {
    const farmer = await prisma.$transaction(async (tx) => {
      let familyId: string | null = null;

      if (normalized.farmerKind === "family_head") {
        if (existing.familyId && existing.family) {
          await tx.farmerFamily.update({
            where: { id: existing.familyId },
            data: {
              accountNumber: normalized.accountNumber,
              name: `${normalized.name} Family`,
              stationId: normalized.stationId,
              localityId: normalized.localityId,
            },
          });
          familyId = existing.familyId;
        } else {
          const family = await tx.farmerFamily.create({
            data: {
              accountNumber: normalized.accountNumber,
              name: `${normalized.name} Family`,
              stationId: normalized.stationId,
              localityId: normalized.localityId,
            },
          });
          familyId = family.id;
        }
      } else if (normalized.farmerKind === "family_member" && selectedFamily) {
        familyId = selectedFamily.id;
      }

      if (
        existingKind === "family_head" &&
        normalized.farmerKind !== "family_head" &&
        existing.familyId
      ) {
        await tx.farmerFamily.delete({ where: { id: existing.familyId } });
      }

      return tx.farmer.update({
        where: { id: parsed.data.id },
        data: buildFarmerData(normalized, familyId),
        include: farmerInclude,
      });
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
    const existing = await prisma.farmer.findUnique({
      where: { id },
      select: { familyId: true },
    });

    if (!existing) {
      return actionError("Farmer not found.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.farmer.delete({ where: { id } });

      if (existing.familyId) {
        const remainingMembers = await tx.farmer.count({
          where: { familyId: existing.familyId },
        });

        if (remainingMembers === 0) {
          await tx.farmerFamily.delete({ where: { id: existing.familyId } });
        }
      }
    });

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "farmer"));
  }
}
