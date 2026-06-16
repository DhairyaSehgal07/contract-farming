import type { RequisitionStatus } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";

function statusVariant(
  status: RequisitionStatus,
): "default" | "destructive" | "outline" {
  switch (status) {
    case "APPROVED":
      return "default";
    case "REJECTED":
      return "destructive";
    default:
      return "outline";
  }
}

function statusLabel(status: RequisitionStatus) {
  switch (status) {
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    default:
      return "Pending";
  }
}

export function RequisitionStatusBadge({
  status,
}: {
  status: RequisitionStatus;
}) {
  return <Badge variant={statusVariant(status)}>{statusLabel(status)}</Badge>;
}
