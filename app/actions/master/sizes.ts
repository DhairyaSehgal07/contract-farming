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
  type CreateSizeInput,
  createSizeSchema,
  type UpdateSizeInput,
  toSizeCreateData,
  toSizeUpdateData,
  updateSizeSchema,
} from "@/lib/schemas/master/size";

export type SizeRow = {
  id: string;
  name: string;
  bagsPerAcre: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function listSizes(): Promise<ActionResult<SizeRow[]>> {
  const authError = await requireMasterReadAction();
  if (authError) return authError;

  try {
    const data = await prisma.size.findMany({ orderBy: { name: "asc" } });
    return actionSuccess(data);
  } catch (error) {
    console.error("listSizes failed:", error);
    return actionError(getPrismaErrorMessage(error, "size"));
  }
}

export async function createSize(
  input: CreateSizeInput,
): Promise<ActionResult<SizeRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = createSizeSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  try {
    const data = await prisma.size.create({
      data: toSizeCreateData(parsed.data),
    });
    return actionSuccess(data);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "size"));
  }
}

export async function updateSize(
  input: UpdateSizeInput,
): Promise<ActionResult<SizeRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = updateSizeSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const { id, ...data } = toSizeUpdateData(parsed.data);

  try {
    const updated = await prisma.size.update({
      where: { id },
      data,
    });
    return actionSuccess(updated);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "size"));
  }
}

export async function deleteSize(id: string): Promise<ActionResult> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  if (!id) {
    return actionError("ID is required.");
  }

  try {
    await prisma.size.delete({ where: { id } });
    return actionSuccess(undefined);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "size"));
  }
}
