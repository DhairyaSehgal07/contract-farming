import { requireAppPermissionAction } from "@/lib/auth/authorization";
import type { ActionResult } from "@/lib/schemas/master/action-result";

export async function requireDispatchReadAction(): Promise<ActionResult<never> | null> {
  return requireAppPermissionAction("dispatch", "read");
}

export async function requireDispatchWriteAction(): Promise<ActionResult<never> | null> {
  return requireAppPermissionAction("dispatch", "write");
}
