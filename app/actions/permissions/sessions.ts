"use server";

import { requireManagingDirectorAdminAction } from "@/lib/auth/authorization";
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
