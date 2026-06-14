import { requireAppPermissionAction } from "@/lib/auth/authorization";
import type { ActionResult } from "@/lib/schemas/master/action-result";

export async function requireRequisitionReadAction(): Promise<ActionResult<never> | null> {
  return requireAppPermissionAction("requisition", "read");
}

export async function requireRequisitionWriteAction(): Promise<ActionResult<never> | null> {
  return requireAppPermissionAction("requisition", "write");
}

export async function requireRequisitionApproveAction(): Promise<ActionResult<never> | null> {
  return requireAppPermissionAction("requisition", "approve");
}
