"use server";

import prisma from "@/lib/prisma";
import {
  type ActionResult,
  actionError,
  actionSuccess,
} from "@/lib/schemas/master/action-result";
import { requireAuthAction } from "@/lib/schemas/master/auth";
import {
  type CreateLookupInput,
  createLookupSchema,
  type UpdateLookupInput,
  updateLookupSchema,
} from "@/lib/schemas/master/lookup";
import { getPrismaErrorMessage } from "@/lib/schemas/master/prisma-errors";

export type SizeRow = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function listSizes(): Promise<ActionResult<SizeRow[]>> {
  const authError = await requireAuthAction();
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
  input: CreateLookupInput,
): Promise<ActionResult<SizeRow>> {
  const authError = await requireAuthAction();
  if (authError) return authError;

  const parsed = createLookupSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  try {
    const data = await prisma.size.create({ data: parsed.data });
    return actionSuccess(data);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "size"));
  }
}

export async function updateSize(
  input: UpdateLookupInput,
): Promise<ActionResult<SizeRow>> {
  const authError = await requireAuthAction();
  if (authError) return authError;

  const parsed = updateLookupSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  try {
    const data = await prisma.size.update({
      where: { id: parsed.data.id },
      data: { name: parsed.data.name },
    });
    return actionSuccess(data);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "size"));
  }
}

export async function deleteSize(id: string): Promise<ActionResult> {
  const authError = await requireAuthAction();
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
