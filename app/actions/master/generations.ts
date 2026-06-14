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
  type CreateLookupInput,
  createLookupSchema,
  type UpdateLookupInput,
  updateLookupSchema,
} from "@/lib/schemas/master/lookup";
import { getPrismaErrorMessage } from "@/lib/schemas/master/prisma-errors";

export type GenerationRow = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function listGenerations(): Promise<
  ActionResult<GenerationRow[]>
> {
  const authError = await requireMasterReadAction();
  if (authError) return authError;

  try {
    const data = await prisma.generation.findMany({ orderBy: { name: "asc" } });
    return actionSuccess(data);
  } catch (error) {
    console.error("listGenerations failed:", error);
    return actionError(getPrismaErrorMessage(error, "generation"));
  }
}

export async function createGeneration(
  input: CreateLookupInput,
): Promise<ActionResult<GenerationRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = createLookupSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  try {
    const data = await prisma.generation.create({ data: parsed.data });
    return actionSuccess(data);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "generation"));
  }
}

export async function updateGeneration(
  input: UpdateLookupInput,
): Promise<ActionResult<GenerationRow>> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  const parsed = updateLookupSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  try {
    const data = await prisma.generation.update({
      where: { id: parsed.data.id },
      data: { name: parsed.data.name },
    });
    return actionSuccess(data);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "generation"));
  }
}

export async function deleteGeneration(id: string): Promise<ActionResult> {
  const authError = await requireMasterWriteAction();
  if (authError) return authError;

  if (!id) {
    return actionError("ID is required.");
  }

  try {
    await prisma.generation.delete({ where: { id } });
    return actionSuccess(undefined);
  } catch (error) {
    return actionError(getPrismaErrorMessage(error, "generation"));
  }
}
