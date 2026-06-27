import { requireAppPermissionAction } from "@/lib/auth/authorization";
import type { ActionResult } from "@/lib/schemas/master/action-result";

export async function requireTransferReadAction(): Promise<ActionResult<never> | null> {
  return requireAppPermissionAction("transfer", "read");
}

export async function requireTransferWriteAction(): Promise<ActionResult<never> | null> {
  return requireAppPermissionAction("transfer", "write");
}
