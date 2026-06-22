import type { RequisitionDetail } from "@/app/actions/requisition/requisitions";
import { parseDateOnly } from "@/lib/date";
import {
  getOrderedAcres,
  getOrderedBagQuantity,
  getRemainingAcres,
  isAcresBasedRequisition,
  isBagsBasedRequisition,
} from "@/lib/requisition/quantity";

export type RequisitionStepStatus =
  | "complete"
  | "active"
  | "upcoming"
  | "failed"
  | "skipped";

export type RequisitionStepState = {
  title: string;
  description: string;
  status: RequisitionStepStatus;
};

function formatDate(value: string) {
  return parseDateOnly(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function isFulfilled(detail: RequisitionDetail) {
  if (detail.status === "FULFILLED") {
    return true;
  }

  const fulfilled = Number.parseFloat(detail.fulfilledQuantity);

  if (isBagsBasedRequisition(detail)) {
    const initial = detail.initialQuantity
      ? Number.parseFloat(detail.initialQuantity)
      : 0;

    if (initial <= 0) {
      return detail.dispatchAssignments.length > 0 && fulfilled > 0;
    }

    return fulfilled >= initial;
  }

  if (isAcresBasedRequisition(detail)) {
    const remainingAcres = getRemainingAcres(detail);
    return remainingAcres !== null && remainingAcres <= 0;
  }

  return false;
}

function hasDispatches(detail: RequisitionDetail) {
  return detail.dispatchAssignments.length > 0;
}

function isRejected(detail: RequisitionDetail) {
  return detail.status === "REJECTED";
}

function isPending(detail: RequisitionDetail) {
  return detail.status === "PENDING";
}

function isApproved(detail: RequisitionDetail) {
  return detail.status === "APPROVED" || detail.status === "FULFILLED";
}

function getSubmittedStep(detail: RequisitionDetail): RequisitionStepState {
  return {
    title: "Submitted",
    description: `Created by ${detail.createdBy.name} on ${formatDateTime(detail.createdAt)}`,
    status: "complete",
  };
}

function getReviewStep(detail: RequisitionDetail): RequisitionStepState {
  if (isPending(detail)) {
    return {
      title: "Review",
      description: "Awaiting approval",
      status: "active",
    };
  }

  if (isRejected(detail)) {
    const rejectedOn = detail.rejectionDate
      ? formatDate(detail.rejectionDate)
      : detail.reviewedAt
        ? formatDateTime(detail.reviewedAt)
        : "—";

    return {
      title: "Review",
      description:
        detail.rejectionRemarks ??
        `Rejected by ${detail.reviewedBy?.name ?? "reviewer"} on ${rejectedOn}`,
      status: "failed",
    };
  }

  const reviewer = detail.reviewedBy?.name ?? "Reviewer";
  const approvedOn = detail.approvalDate
    ? formatDate(detail.approvalDate)
    : detail.reviewedAt
      ? formatDateTime(detail.reviewedAt)
      : "—";

  return {
    title: "Review",
    description: `Approved by ${reviewer} on ${approvedOn}`,
    status: "complete",
  };
}

function getDispatchedStep(detail: RequisitionDetail): RequisitionStepState {
  if (isRejected(detail)) {
    return {
      title: "Dispatched",
      description: "Not applicable",
      status: "skipped",
    };
  }

  const count = detail.dispatchAssignments.length;

  if (!hasDispatches(detail)) {
    return {
      title: "Dispatched",
      description: isApproved(detail)
        ? "No dispatches yet"
        : "Available after approval",
      status: isApproved(detail) ? "active" : "upcoming",
    };
  }

  return {
    title: "Dispatched",
    description: `${count} dispatch${count === 1 ? "" : "es"} linked`,
    status: isFulfilled(detail) ? "complete" : "active",
  };
}

function getFulfilledStep(detail: RequisitionDetail): RequisitionStepState {
  if (isRejected(detail)) {
    return {
      title: "Fulfilled",
      description: "Not applicable",
      status: "skipped",
    };
  }

  const ordered = isAcresBasedRequisition(detail)
    ? `${getOrderedAcres(detail) ?? "—"} acres`
    : `${getOrderedBagQuantity(detail)?.toString() ?? detail.initialQuantity ?? "—"} bags`;
  const fulfilled = isAcresBasedRequisition(detail)
    ? `${detail.fulfilledAcres} acres (${detail.fulfilledQuantity} bags)`
    : `${detail.fulfilledQuantity} bags`;

  if (isFulfilled(detail)) {
    return {
      title: "Fulfilled",
      description: `${fulfilled} / ${ordered} dispatched`,
      status: "complete",
    };
  }

  if (hasDispatches(detail)) {
    return {
      title: "Fulfilled",
      description: `${fulfilled} / ${ordered} dispatched`,
      status: "active",
    };
  }

  return {
    title: "Fulfilled",
    description: "Pending dispatch",
    status: "upcoming",
  };
}

export function getRequisitionStepState(
  detail: RequisitionDetail,
): RequisitionStepState[] {
  return [
    getSubmittedStep(detail),
    getReviewStep(detail),
    getDispatchedStep(detail),
    getFulfilledStep(detail),
  ];
}

export function formatRequisitionHeaderDate(value: string) {
  return formatDate(value);
}
