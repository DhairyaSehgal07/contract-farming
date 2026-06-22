"use client";

import { ArrowLeft, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { RequisitionDetail } from "@/app/actions/requisition/requisitions";
import { DeleteConfirmDialog } from "@/components/master/delete-confirm-dialog";
import { RequisitionApproveDialog } from "@/components/requisition/requisition-approve-dialog";
import { RequisitionDispatchCard } from "@/components/requisition/requisition-dispatch-card";
import { RequisitionFormSheet } from "@/components/requisition/requisition-form-sheet";
import { RequisitionRemarksDisplay } from "@/components/requisition/requisition-remarks-display";
import { RequisitionProgressStepper } from "@/components/requisition/requisition-progress-stepper";
import { RequisitionRejectDialog } from "@/components/requisition/requisition-reject-dialog";
import { RequisitionStatusBadge } from "@/components/requisition/requisition-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useApproveRequisition,
  useDeleteRequisition,
  useRejectRequisition,
  useRequisition,
  useUpdateRequisition,
} from "@/hooks/requisition/use-requisitions";
import {
  getFulfillmentPercent,
  getOrderedAcres,
  getOrderedBagQuantity,
  isAcresBasedRequisition,
} from "@/lib/requisition/quantity";
import { parseDateOnly } from "@/lib/date";
import { formatRequisitionHeaderDate } from "@/lib/requisition/step-state";
import type { RequisitionFormInput } from "@/lib/schemas/requisition/requisition";

type RequisitionDetailSectionProps = {
  id: string;
  canApprove: boolean;
  canWrite: boolean;
};

type RequisitionDetailContentProps = {
  data: RequisitionDetail;
  canApprove: boolean;
  canWrite: boolean;
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

function formatDecimal(value: string | null) {
  return value ?? "—";
}

function formatOrderedQuantity(data: RequisitionDetail) {
  if (isAcresBasedRequisition(data)) {
    const orderedAcres = getOrderedAcres(data);
    return orderedAcres !== null ? `${orderedAcres} acres` : null;
  }

  const ordered = getOrderedBagQuantity(data);
  return ordered !== null ? `${ordered} bags` : null;
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function RequisitionDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Skeleton className="h-80 rounded-4xl" />
        <div className="flex flex-col gap-6">
          <Skeleton className="h-64 rounded-4xl" />
          <Skeleton className="h-32 rounded-4xl" />
          <Skeleton className="h-48 rounded-4xl" />
        </div>
      </div>
    </div>
  );
}

function RequisitionDetailContent({
  data,
  canApprove,
  canWrite,
}: RequisitionDetailContentProps) {
  const router = useRouter();
  const updateMutation = useUpdateRequisition();
  const deleteMutation = useDeleteRequisition();
  const approveMutation = useApproveRequisition();
  const rejectMutation = useRejectRequisition();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const isPendingStatus = data.status === "PENDING";
  const showApprovalActions = canApprove && isPendingStatus;
  const showWriteActions = canWrite && isPendingStatus;
  const orderedQuantity = formatOrderedQuantity(data);
  const fulfillmentPercent = getFulfillmentPercent(data);

  function handleFormSubmit(values: RequisitionFormInput) {
    updateMutation.mutate(
      { id: data.id, ...values },
      {
        onSuccess: () => setFormOpen(false),
      },
    );
  }

  function handleDeleteConfirm() {
    deleteMutation.mutate(data.id, {
      onSuccess: () => {
        router.push("/requisition");
      },
    });
  }

  function handleApproveConfirm(approvedDeliveryDate: string) {
    approveMutation.mutate(
      { id: data.id, approvedDeliveryDate },
      {
        onSuccess: () => setApproveOpen(false),
      },
    );
  }

  function handleRejectConfirm(rejectionRemarks: string) {
    rejectMutation.mutate(
      { id: data.id, rejectionRemarks },
      {
        onSuccess: () => setRejectOpen(false),
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" className="w-fit" asChild>
          <Link href="/requisition">
            <ArrowLeft />
            Back to Requisitions
          </Link>
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-2xl font-medium">
                {data.farmer.name}
              </h2>
              <RequisitionStatusBadge
                status={data.status}
                reviewedByName={data.reviewedBy?.name}
                approvalDate={data.approvalDate}
                rejectionRemarks={data.rejectionRemarks}
              />
            </div>
            <p className="text-muted-foreground">
              {data.variety.name} · Requisition date{" "}
              {formatRequisitionHeaderDate(data.requisitionDate)}
            </p>
          </div>

          {showApprovalActions || showWriteActions ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Actions
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {showApprovalActions ? (
                  <>
                    <DropdownMenuItem onClick={() => setApproveOpen(true)}>
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setRejectOpen(true)}
                    >
                      Reject
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : null}
                {showWriteActions ? (
                  <>
                    <DropdownMenuItem onClick={() => setFormOpen(true)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeleteOpen(true)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="lg:sticky lg:top-6 lg:self-start">
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>Requisition lifecycle</CardDescription>
          </CardHeader>
          <CardContent>
            <RequisitionProgressStepper detail={data} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Requisition details</CardTitle>
              <CardDescription>
                Farmer, variety, dates, and audit information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailField
                  label="Farmer"
                  value={`${data.farmer.name} (${data.farmer.accountNumber})`}
                />
                <DetailField label="Variety" value={data.variety.name} />
                <DetailField
                  label="Requisition date"
                  value={formatDate(data.requisitionDate)}
                />
                <DetailField
                  label="Requested delivery"
                  value={formatDate(data.requestedDeliveryDate)}
                />
                <DetailField
                  label="Approved delivery"
                  value={
                    data.approvedDeliveryDate
                      ? formatDate(data.approvedDeliveryDate)
                      : "—"
                  }
                />
                <DetailField label="Acres" value={formatDecimal(data.acres)} />
                <DetailField label="Bags" value={formatDecimal(data.initialQuantity)} />
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <dt className="text-muted-foreground">Remarks</dt>
                  <dd>
                    <RequisitionRemarksDisplay
                      remarks={data.remarks}
                      variant="detail"
                    />
                  </dd>
                </div>
                <DetailField
                  label="Created by"
                  value={`${data.createdBy.name} on ${formatDateTime(data.createdAt)}`}
                />
                {data.reviewedBy ? (
                  <DetailField
                    label="Reviewed by"
                    value={data.reviewedBy.name}
                  />
                ) : null}
                {data.approvalDate ? (
                  <DetailField
                    label="Approval date"
                    value={formatDate(data.approvalDate)}
                  />
                ) : null}
                {data.rejectionDate ? (
                  <DetailField
                    label="Rejection date"
                    value={formatDate(data.rejectionDate)}
                  />
                ) : null}
                {data.rejectionRemarks ? (
                  <DetailField
                    label="Rejection remarks"
                    value={data.rejectionRemarks}
                  />
                ) : null}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fulfillment</CardTitle>
              <CardDescription>
                Quantity dispatched against this requisition
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-end justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  {isAcresBasedRequisition(data) ? (
                    <>
                      <span className="text-2xl font-medium">
                        {data.fulfilledAcres}
                        {data.acres ? ` / ${data.acres}` : ""} acres
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {data.fulfilledQuantity} bags dispatched across lots
                        {data.remainingQuantity
                          ? ` · ${data.remainingQuantity} acres remaining`
                          : ""}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-medium">
                        {data.fulfilledQuantity}
                        {orderedQuantity ? ` / ${orderedQuantity}` : ""}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {data.remainingQuantity
                          ? `${data.remainingQuantity} bags remaining`
                          : "—"}
                      </span>
                    </>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {fulfillmentPercent}%
                </span>
              </div>
              <Progress value={fulfillmentPercent} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Associated dispatches</CardTitle>
              <CardDescription>
                Dispatch records linked to this requisition
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {data.dispatchAssignments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No dispatches linked yet.
                </p>
              ) : (
                data.dispatchAssignments.map((assignment) => (
                  <RequisitionDispatchCard
                    key={assignment.id}
                    assignment={assignment}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <RequisitionFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        mode="edit"
        initialRequisition={data}
        isPending={updateMutation.isPending}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete requisition"
        description={`Are you sure you want to delete the requisition for "${data.farmer.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />

      <RequisitionApproveDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        farmerName={data.farmer.name}
        requestedDeliveryDate={data.requestedDeliveryDate}
        onConfirm={handleApproveConfirm}
        isPending={approveMutation.isPending}
      />

      <RequisitionRejectDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        farmerName={data.farmer.name}
        onConfirm={handleRejectConfirm}
        isPending={rejectMutation.isPending}
      />
    </div>
  );
}

export function RequisitionDetailSection({
  id,
  canApprove,
  canWrite,
}: RequisitionDetailSectionProps) {
  const { data, isPending, isError, error } = useRequisition(id);

  if (isPending) {
    return <RequisitionDetailSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" className="w-fit" asChild>
          <Link href="/requisition">
            <ArrowLeft />
            Back to Requisitions
          </Link>
        </Button>
        <p className="text-sm text-destructive">
          {error?.message ?? "Requisition not found."}
        </p>
      </div>
    );
  }

  return (
    <RequisitionDetailContent
      data={data}
      canApprove={canApprove}
      canWrite={canWrite}
    />
  );
}
