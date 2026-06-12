"use server";

import { headers } from "next/headers";
import { requireManagingDirectorAdminAction } from "@/lib/auth/authorization";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import {
  type ActionResult,
  actionError,
  actionSuccess,
} from "@/lib/schemas/master/action-result";

export type SessionRow = {
  id: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  impersonatedBy: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export async function listAllSessions(): Promise<ActionResult<SessionRow[]>> {
  const authError = await requireManagingDirectorAdminAction();
  if (authError) return authError;

  try {
    const sessions = await prisma.session.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return actionSuccess(
      sessions.map((session) => ({
        id: session.id,
        token: session.token,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        impersonatedBy: session.impersonatedBy,
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
        },
      })),
    );
  } catch {
    return actionError("Failed to load sessions.");
  }
}

export async function deleteSession(
  sessionToken: string,
): Promise<ActionResult<void>> {
  const authError = await requireManagingDirectorAdminAction();
  if (authError) return authError;

  const session = await getServerSession();
  if (!session) {
    return actionError("You must be signed in to perform this action.");
  }

  if (sessionToken === session.session.token) {
    return actionError("You cannot delete your current session.");
  }

  try {
    await auth.api.revokeUserSession({
      body: { sessionToken },
      headers: await headers(),
    });
    return actionSuccess(undefined);
  } catch {
    return actionError("Failed to delete session.");
  }
}

export async function clearSessionHistory(): Promise<
  ActionResult<{ deletedCount: number }>
> {
  const authError = await requireManagingDirectorAdminAction();
  if (authError) return authError;

  const session = await getServerSession();
  if (!session) {
    return actionError("You must be signed in to perform this action.");
  }

  try {
    const result = await prisma.session.deleteMany({
      where: { token: { not: session.session.token } },
    });
    return actionSuccess({ deletedCount: result.count });
  } catch {
    return actionError("Failed to clear session history.");
  }
}
