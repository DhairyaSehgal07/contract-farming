import { requireAppPermissionAction } from "@/lib/auth/authorization";
import { getServerSession } from "@/lib/auth/session";
import {
  type ActionResult,
  actionError,
} from "@/lib/schemas/master/action-result";

export async function getAuthenticatedSession(): Promise<NonNullable<
  Awaited<ReturnType<typeof getServerSession>>
> | null> {
  return getServerSession();
}

export async function requireAuthAction(): Promise<ActionResult<never> | null> {
  const session = await getAuthenticatedSession();

  if (!session) {
    return actionError("You must be signed in to perform this action.");
  }

  return null;
}

export async function requireMasterReadAction(): Promise<ActionResult<never> | null> {
  return requireAppPermissionAction("master", "read");
}

export async function requireMasterWriteAction(): Promise<ActionResult<never> | null> {
  return requireAppPermissionAction("master", "write");
}
