import { sessionHasAppPermission } from "@/lib/auth/authorization";
import type { AppAction, AppResource } from "@/lib/auth/permission-catalog";
import { getServerSession } from "@/lib/auth/session";
import {
  type ActionResult,
  actionError,
} from "@/lib/schemas/master/action-result";

const FARMER_READ_PERMISSIONS: { resource: AppResource; action: AppAction }[] = [
  { resource: "master", action: "read" },
  { resource: "requisition", action: "read" },
  { resource: "dispatch", action: "read" },
  { resource: "transfer", action: "read" },
];

type Session = NonNullable<Awaited<ReturnType<typeof getServerSession>>>;

export async function sessionHasFarmerReadPermission(
  session: Session,
): Promise<boolean> {
  for (const permission of FARMER_READ_PERMISSIONS) {
    if (
      await sessionHasAppPermission(
        session,
        permission.resource,
        permission.action,
      )
    ) {
      return true;
    }
  }
  return false;
}

export async function requireFarmerReadAction(): Promise<ActionResult<never> | null> {
  const session = await getServerSession();
  if (!session) {
    return actionError("You must be signed in to perform this action.");
  }

  const allowed = await sessionHasFarmerReadPermission(session);
  if (!allowed) {
    return actionError("You do not have permission to perform this action.");
  }

  return null;
}
