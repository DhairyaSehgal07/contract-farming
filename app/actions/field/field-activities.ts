"use server";

import type { FieldActivityRound } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";
import { parseDateOnly } from "@/lib/date";
import { requireFarmerReadAction } from "@/lib/schemas/farmer/auth";
import {
  type ActionResult,
  actionError,
  actionSuccess,
} from "@/lib/schemas/master/action-result";
import { requireMasterWriteAction } from "@/lib/schemas/master/auth";
import { getPrismaErrorMessage } from "@/lib/schemas/master/prisma-errors";
import {
  type CreateFieldDehaulmingInput,
  type CreateFieldHarvestInput,
  type CreateFieldRougingInput,
  type CreateFieldStripTestInput,
  createFieldDehaulmingSchema,
  createFieldHarvestSchema,
  createFieldRougingSchema,
  createFieldStripTestSchema,
  normalizeFieldInspectionInput,
  type UpdateFieldDehaulmingInput,
  type UpdateFieldHarvestInput,
  type UpdateFieldRougingInput,
  type UpdateFieldStripTestInput,
  updateFieldDehaulmingSchema,
  updateFieldHarvestSchema,
  updateFieldRougingSchema,
  updateFieldStripTestSchema,
} from "@/lib/schemas/field/inspection";
import {
  type CreateFieldIrrigationInput,
  createFieldIrrigationSchema,
  normalizeFieldIrrigationInput,
  type UpdateFieldIrrigationInput,
  updateFieldIrrigationSchema,
} from "@/lib/schemas/field/irrigation";
import {
  type CreateFieldPlantationInput,
  createFieldPlantationSchema,
  normalizeFieldPlantationInput,
  type UpdateFieldPlantationInput,
  updateFieldPlantationSchema,
} from "@/lib/schemas/field/plantation";

function serializeDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export type FieldPlantationRow = {
  id: string;
  fieldId: string;
  varietyId: string;
  varietyName: string;
  sizeId: string;
  sizeName: string;
  bagCount: string;
  acresPlanted: string;
  plantedAt: string;
  imageUrl: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FieldIrrigationRow = {
  id: string;
  fieldId: string;
  cycleNumber: number;
  irrigatedAt: string;
  imageUrl: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FieldInspectionRow = {
  id: string;
  fieldId: string;
  activityDate: string;
  result: string | null;
  remarks: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FieldDehaulmingRow = FieldInspectionRow & {
  round: FieldActivityRound;
};

export type FieldStripTestRow = FieldInspectionRow & {
  round: FieldActivityRound;
};

export type FieldDetail = {
  id: string;
  farmerId: string;
  name: string;
  geoLocation: string;
  acres: string;
  createdAt: string;
  updatedAt: string;
  farmer: {
    id: string;
    name: string;
    accountNumber: string;
  };
  plantations: FieldPlantationRow[];
  irrigations: FieldIrrigationRow[];
  dehaulming: FieldDehaulmingRow[];
  rouging: FieldInspectionRow[];
  stripTests: FieldStripTestRow[];
  harvests: FieldInspectionRow[];
};

function serializePlantation(row: {
  id: string;
  fieldId: string;
  varietyId: string;
  variety: { name: string };
  sizeId: string;
  size: { name: string };
  bagCount: { toString(): string };
  acresPlanted: { toString(): string };
  plantedAt: Date;
  imageUrl: string | null;
  remarks: string | null;
  createdAt: Date;
  updatedAt: Date;
}): FieldPlantationRow {
  return {
    id: row.id,
    fieldId: row.fieldId,
    varietyId: row.varietyId,
    varietyName: row.variety.name,
    sizeId: row.sizeId,
    sizeName: row.size.name,
    bagCount: row.bagCount.toString(),
    acresPlanted: row.acresPlanted.toString(),
    plantedAt: serializeDate(row.plantedAt),
    imageUrl: row.imageUrl,
    remarks: row.remarks,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function serializeIrrigation(row: {
  id: string;
  fieldId: string;
  cycleNumber: number;
  irrigatedAt: Date;
  imageUrl: string | null;
  remarks: string | null;
  createdAt: Date;
  updatedAt: Date;
}): FieldIrrigationRow {
  return {
    id: row.id,
    fieldId: row.fieldId,
    cycleNumber: row.cycleNumber,
    irrigatedAt: serializeDate(row.irrigatedAt),
    imageUrl: row.imageUrl,
    remarks: row.remarks,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function serializeInspection(row: {
  id: string;
  fieldId: string;
  activityDate: Date;
  result: string | null;
  remarks: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): FieldInspectionRow {
  return {
    id: row.id,
    fieldId: row.fieldId,
    activityDate: serializeDate(row.activityDate),
    result: row.result,
    remarks: row.remarks,
    imageUrl: row.imageUrl,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function requireFieldExists(fieldId: string) {
  const field = await prisma.farmerField.findUnique({
    where: { id: fieldId },
    select: { id: true },
  });

  if (!field) {
    return actionError("Field not found.") as ActionResult<never>;
  }

  return null;
}

export async function getFieldDetail(
  fieldId: string,
): Promise<ActionResult<FieldDetail>> {
  const authError = await requireFarmerReadAction();
  if (authError) return authError;

  if (!fieldId) {
    return actionError("Field is required.");
  }

  try {
    const field = await prisma.farmerField.findUnique({
      where: { id: fieldId },
      include: {
        farmer: {
          select: { id: true, name: true, accountNumber: true },
        },
        plantations: {
          include: {
            variety: { select: { name: true } },
            size: { select: { name: true } },
          },
          orderBy: [{ plantedAt: "desc" }, { createdAt: "desc" }],
        },
        irrigations: {
          orderBy: [{ cycleNumber: "asc" }],
        },
        dehaulming: {
          orderBy: [{ activityDate: "desc" }, { createdAt: "desc" }],
        },
        rouging: {
          orderBy: [{ activityDate: "desc" }, { createdAt: "desc" }],
        },
        stripTests: {
          orderBy: [{ activityDate: "desc" }, { createdAt: "desc" }],
        },
        harvests: {
          orderBy: [{ activityDate: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    if (!field) {
      return actionError("Field not found.");
    }

    return actionSuccess({
      id: field.id,
      farmerId: field.farmerId,
      name: field.name,
      geoLocation: field.geoLocation,
      acres: field.acres.toString(),
      createdAt: field.createdAt.toISOString(),
      updatedAt: field.updatedAt.toISOString(),
      farmer: field.farmer,
      plantations: field.plantations.map(serializePlantation),
      irrigations: field.irrigations.map(serializeIrrigation),
      dehaulming: field.dehaulming.map((row) => ({
        ...serializeInspection(row),
        round: row.round,
      })),
      rouging: field.rouging.map(serializeInspection),
      stripTests: field.stripTests.map((row) => ({
        ...serializeInspection(row),
        round: row.round,
      })),
      harvests: field.harvests.map(serializeInspection),
    });
  } catch (error) {
    console.error("getFieldDetail failed:", error);
    return actionError(getPrismaErrorMessage(error, "field"));
  }
}

export async function createFieldPlantation(
  input: CreateFieldPlantationInput,
): Promise<ActionResult<FieldPlantationRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = createFieldPlantationSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const fieldError = await requireFieldExists(parsed.data.fieldId);
  if (fieldError) return fieldError;

  const data = normalizeFieldPlantationInput(parsed.data);

  try {
    const row = await prisma.fieldPlantation.create({
      data: {
        fieldId: parsed.data.fieldId,
        varietyId: data.varietyId,
        sizeId: data.sizeId,
        bagCount: data.bagCount,
        acresPlanted: data.acresPlanted,
        plantedAt: parseDateOnly(data.plantedAt),
        imageUrl: data.imageUrl,
        remarks: data.remarks,
      },
      include: {
        variety: { select: { name: true } },
        size: { select: { name: true } },
      },
    });

    return actionSuccess(serializePlantation(row));
  } catch (error) {
    console.error("createFieldPlantation failed:", error);
    return actionError(getPrismaErrorMessage(error, "plantation"));
  }
}

export async function updateFieldPlantation(
  input: UpdateFieldPlantationInput,
): Promise<ActionResult<FieldPlantationRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = updateFieldPlantationSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const data = normalizeFieldPlantationInput(parsed.data);

  try {
    const row = await prisma.fieldPlantation.update({
      where: { id: parsed.data.id },
      data: {
        varietyId: data.varietyId,
        sizeId: data.sizeId,
        bagCount: data.bagCount,
        acresPlanted: data.acresPlanted,
        plantedAt: parseDateOnly(data.plantedAt),
        imageUrl: data.imageUrl,
        remarks: data.remarks,
      },
      include: {
        variety: { select: { name: true } },
        size: { select: { name: true } },
      },
    });

    return actionSuccess(serializePlantation(row));
  } catch (error) {
    console.error("updateFieldPlantation failed:", error);
    return actionError(getPrismaErrorMessage(error, "plantation"));
  }
}

export async function deleteFieldPlantation(id: string): Promise<ActionResult> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  if (!id) {
    return actionError("ID is required.");
  }

  try {
    await prisma.fieldPlantation.delete({ where: { id } });
    return actionSuccess(undefined);
  } catch (error) {
    console.error("deleteFieldPlantation failed:", error);
    return actionError(getPrismaErrorMessage(error, "plantation"));
  }
}

export async function createFieldIrrigation(
  input: CreateFieldIrrigationInput,
): Promise<ActionResult<FieldIrrigationRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = createFieldIrrigationSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const fieldError = await requireFieldExists(parsed.data.fieldId);
  if (fieldError) return fieldError;

  const data = normalizeFieldIrrigationInput(parsed.data);

  try {
    const row = await prisma.fieldIrrigation.create({
      data: {
        fieldId: parsed.data.fieldId,
        cycleNumber: data.cycleNumber,
        irrigatedAt: parseDateOnly(data.irrigatedAt),
        imageUrl: data.imageUrl,
        remarks: data.remarks,
      },
    });

    return actionSuccess(serializeIrrigation(row));
  } catch (error) {
    console.error("createFieldIrrigation failed:", error);
    return actionError(getPrismaErrorMessage(error, "irrigation"));
  }
}

export async function updateFieldIrrigation(
  input: UpdateFieldIrrigationInput,
): Promise<ActionResult<FieldIrrigationRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = updateFieldIrrigationSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const data = normalizeFieldIrrigationInput(parsed.data);

  try {
    const row = await prisma.fieldIrrigation.update({
      where: { id: parsed.data.id },
      data: {
        cycleNumber: data.cycleNumber,
        irrigatedAt: parseDateOnly(data.irrigatedAt),
        imageUrl: data.imageUrl,
        remarks: data.remarks,
      },
    });

    return actionSuccess(serializeIrrigation(row));
  } catch (error) {
    console.error("updateFieldIrrigation failed:", error);
    return actionError(getPrismaErrorMessage(error, "irrigation"));
  }
}

export async function deleteFieldIrrigation(id: string): Promise<ActionResult> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  if (!id) {
    return actionError("ID is required.");
  }

  try {
    await prisma.fieldIrrigation.delete({ where: { id } });
    return actionSuccess(undefined);
  } catch (error) {
    console.error("deleteFieldIrrigation failed:", error);
    return actionError(getPrismaErrorMessage(error, "irrigation"));
  }
}

export async function createFieldDehaulming(
  input: CreateFieldDehaulmingInput,
): Promise<ActionResult<FieldDehaulmingRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = createFieldDehaulmingSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const fieldError = await requireFieldExists(parsed.data.fieldId);
  if (fieldError) return fieldError;

  const data = normalizeFieldInspectionInput(parsed.data);

  try {
    const row = await prisma.fieldDehaulming.create({
      data: {
        fieldId: parsed.data.fieldId,
        round: parsed.data.round,
        activityDate: parseDateOnly(data.activityDate),
        result: data.result,
        remarks: data.remarks,
        imageUrl: data.imageUrl,
      },
    });

    return actionSuccess({
      ...serializeInspection(row),
      round: row.round,
    });
  } catch (error) {
    console.error("createFieldDehaulming failed:", error);
    return actionError(getPrismaErrorMessage(error, "dehaulming"));
  }
}

export async function updateFieldDehaulming(
  input: UpdateFieldDehaulmingInput,
): Promise<ActionResult<FieldDehaulmingRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = updateFieldDehaulmingSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const data = normalizeFieldInspectionInput(parsed.data);

  try {
    const row = await prisma.fieldDehaulming.update({
      where: { id: parsed.data.id },
      data: {
        activityDate: parseDateOnly(data.activityDate),
        result: data.result,
        remarks: data.remarks,
        imageUrl: data.imageUrl,
      },
    });

    return actionSuccess({
      ...serializeInspection(row),
      round: row.round,
    });
  } catch (error) {
    console.error("updateFieldDehaulming failed:", error);
    return actionError(getPrismaErrorMessage(error, "dehaulming"));
  }
}

export async function deleteFieldDehaulming(id: string): Promise<ActionResult> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  if (!id) {
    return actionError("ID is required.");
  }

  try {
    await prisma.fieldDehaulming.delete({ where: { id } });
    return actionSuccess(undefined);
  } catch (error) {
    console.error("deleteFieldDehaulming failed:", error);
    return actionError(getPrismaErrorMessage(error, "dehaulming"));
  }
}

export async function createFieldRouging(
  input: CreateFieldRougingInput,
): Promise<ActionResult<FieldInspectionRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = createFieldRougingSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const fieldError = await requireFieldExists(parsed.data.fieldId);
  if (fieldError) return fieldError;

  const data = normalizeFieldInspectionInput(parsed.data);

  try {
    const row = await prisma.fieldRouging.create({
      data: {
        fieldId: parsed.data.fieldId,
        activityDate: parseDateOnly(data.activityDate),
        result: data.result,
        remarks: data.remarks,
        imageUrl: data.imageUrl,
      },
    });

    return actionSuccess(serializeInspection(row));
  } catch (error) {
    console.error("createFieldRouging failed:", error);
    return actionError(getPrismaErrorMessage(error, "rouging"));
  }
}

export async function updateFieldRouging(
  input: UpdateFieldRougingInput,
): Promise<ActionResult<FieldInspectionRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = updateFieldRougingSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const data = normalizeFieldInspectionInput(parsed.data);

  try {
    const row = await prisma.fieldRouging.update({
      where: { id: parsed.data.id },
      data: {
        activityDate: parseDateOnly(data.activityDate),
        result: data.result,
        remarks: data.remarks,
        imageUrl: data.imageUrl,
      },
    });

    return actionSuccess(serializeInspection(row));
  } catch (error) {
    console.error("updateFieldRouging failed:", error);
    return actionError(getPrismaErrorMessage(error, "rouging"));
  }
}

export async function deleteFieldRouging(id: string): Promise<ActionResult> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  if (!id) {
    return actionError("ID is required.");
  }

  try {
    await prisma.fieldRouging.delete({ where: { id } });
    return actionSuccess(undefined);
  } catch (error) {
    console.error("deleteFieldRouging failed:", error);
    return actionError(getPrismaErrorMessage(error, "rouging"));
  }
}

export async function createFieldStripTest(
  input: CreateFieldStripTestInput,
): Promise<ActionResult<FieldStripTestRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = createFieldStripTestSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const fieldError = await requireFieldExists(parsed.data.fieldId);
  if (fieldError) return fieldError;

  const data = normalizeFieldInspectionInput(parsed.data);

  try {
    const row = await prisma.fieldStripTest.create({
      data: {
        fieldId: parsed.data.fieldId,
        round: parsed.data.round,
        activityDate: parseDateOnly(data.activityDate),
        result: data.result,
        remarks: data.remarks,
        imageUrl: data.imageUrl,
      },
    });

    return actionSuccess({
      ...serializeInspection(row),
      round: row.round,
    });
  } catch (error) {
    console.error("createFieldStripTest failed:", error);
    return actionError(getPrismaErrorMessage(error, "strip test"));
  }
}

export async function updateFieldStripTest(
  input: UpdateFieldStripTestInput,
): Promise<ActionResult<FieldStripTestRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = updateFieldStripTestSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const data = normalizeFieldInspectionInput(parsed.data);

  try {
    const row = await prisma.fieldStripTest.update({
      where: { id: parsed.data.id },
      data: {
        activityDate: parseDateOnly(data.activityDate),
        result: data.result,
        remarks: data.remarks,
        imageUrl: data.imageUrl,
      },
    });

    return actionSuccess({
      ...serializeInspection(row),
      round: row.round,
    });
  } catch (error) {
    console.error("updateFieldStripTest failed:", error);
    return actionError(getPrismaErrorMessage(error, "strip test"));
  }
}

export async function deleteFieldStripTest(id: string): Promise<ActionResult> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  if (!id) {
    return actionError("ID is required.");
  }

  try {
    await prisma.fieldStripTest.delete({ where: { id } });
    return actionSuccess(undefined);
  } catch (error) {
    console.error("deleteFieldStripTest failed:", error);
    return actionError(getPrismaErrorMessage(error, "strip test"));
  }
}

export async function createFieldHarvest(
  input: CreateFieldHarvestInput,
): Promise<ActionResult<FieldInspectionRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = createFieldHarvestSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const fieldError = await requireFieldExists(parsed.data.fieldId);
  if (fieldError) return fieldError;

  const data = normalizeFieldInspectionInput(parsed.data);

  try {
    const row = await prisma.fieldHarvest.create({
      data: {
        fieldId: parsed.data.fieldId,
        activityDate: parseDateOnly(data.activityDate),
        result: data.result,
        remarks: data.remarks,
        imageUrl: data.imageUrl,
      },
    });

    return actionSuccess(serializeInspection(row));
  } catch (error) {
    console.error("createFieldHarvest failed:", error);
    return actionError(getPrismaErrorMessage(error, "harvest"));
  }
}

export async function updateFieldHarvest(
  input: UpdateFieldHarvestInput,
): Promise<ActionResult<FieldInspectionRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = updateFieldHarvestSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const data = normalizeFieldInspectionInput(parsed.data);

  try {
    const row = await prisma.fieldHarvest.update({
      where: { id: parsed.data.id },
      data: {
        activityDate: parseDateOnly(data.activityDate),
        result: data.result,
        remarks: data.remarks,
        imageUrl: data.imageUrl,
      },
    });

    return actionSuccess(serializeInspection(row));
  } catch (error) {
    console.error("updateFieldHarvest failed:", error);
    return actionError(getPrismaErrorMessage(error, "harvest"));
  }
}

export async function deleteFieldHarvest(id: string): Promise<ActionResult> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  if (!id) {
    return actionError("ID is required.");
  }

  try {
    await prisma.fieldHarvest.delete({ where: { id } });
    return actionSuccess(undefined);
  } catch (error) {
    console.error("deleteFieldHarvest failed:", error);
    return actionError(getPrismaErrorMessage(error, "harvest"));
  }
}
