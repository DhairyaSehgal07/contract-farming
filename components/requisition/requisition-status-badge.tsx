"use client";

import type { RequisitionStatus } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { parseDateOnly } from "@/lib/date";

function statusVariant(
  status: RequisitionStatus,
): "default" | "destructive" | "outline" | "secondary" {
  switch (status) {
    case "APPROVED":
      return "default";
    case "FULFILLED":
      return "secondary";
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
    case "FULFILLED":
      return "Fulfilled";
    case "REJECTED":
      return "Rejected";
    default:
      return "Pending";
  }
}

function formatStatusDate(value: string) {
  return parseDateOnly(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type RequisitionStatusBadgeProps = {
  status: RequisitionStatus;
  reviewedByName?: string | null;
  approvalDate?: string | null;
  rejectionRemarks?: string | null;
};

function StatusDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

export function RequisitionStatusBadge({
  status,
  reviewedByName,
  approvalDate,
  rejectionRemarks,
}: RequisitionStatusBadgeProps) {
  const isApprovedHoverable =
    status === "APPROVED" && reviewedByName && approvalDate;
  const isRejectedHoverable =
    status === "REJECTED" && reviewedByName && rejectionRemarks;
  const isHoverable = isApprovedHoverable || isRejectedHoverable;

  const badge = (
    <Badge
      variant={statusVariant(status)}
      className={
        isHoverable
          ? "cursor-default transition-opacity hover:opacity-90"
          : undefined
      }
    >
      {statusLabel(status)}
    </Badge>
  );

  if (!isHoverable) {
    return badge;
  }

  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>{badge}</HoverCardTrigger>
      <HoverCardContent align="start" className="w-auto min-w-48">
        <div className="flex flex-col gap-2">
          {isApprovedHoverable ? (
            <>
              <StatusDetail label="Approved by" value={reviewedByName} />
              <StatusDetail
                label="Approved on"
                value={formatStatusDate(approvalDate)}
              />
            </>
          ) : (
            <>
              <StatusDetail label="Rejected by" value={reviewedByName} />
              <StatusDetail
                label="Rejection remarks"
                value={rejectionRemarks ?? "—"}
              />
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
