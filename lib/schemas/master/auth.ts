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
