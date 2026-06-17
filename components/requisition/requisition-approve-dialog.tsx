"use client";

import { useEffect, useState } from "react";
import { DatePickerInput } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { parseDateOnly } from "@/lib/date";

type RequisitionApproveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmerName: string;
  requestedDeliveryDate?: string;
  onConfirm: (approvedDeliveryDate: string) => void;
  isPending?: boolean;
};

export function RequisitionApproveDialog({
  open,
  onOpenChange,
  farmerName,
  requestedDeliveryDate,
  onConfirm,
  isPending = false,
}: RequisitionApproveDialogProps) {
  const [approvedDeliveryDate, setApprovedDeliveryDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setApprovedDeliveryDate("");
      setError(null);
      return;
    }

    setApprovedDeliveryDate(requestedDeliveryDate ?? "");
    setError(null);
  }, [open, requestedDeliveryDate]);

  function handleConfirm() {
    const trimmed = approvedDeliveryDate.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      setError("Approved delivery date is required.");
      return;
    }

    setError(null);
    onConfirm(trimmed);
  }

  const selectedDate = approvedDeliveryDate
    ? parseDateOnly(approvedDeliveryDate)
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve requisition</DialogTitle>
          <DialogDescription>
            Approve the requisition for &ldquo;{farmerName}&rdquo;. Select the
            approved delivery date.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field data-invalid={error ? true : undefined}>
            <DatePickerInput
              id="approved-delivery-date"
              label="Approved delivery date"
              placeholder="Pick a date"
              value={selectedDate}
              aria-invalid={error ? true : undefined}
              onDateChange={(value) => {
                setApprovedDeliveryDate(value);
                if (error) setError(null);
              }}
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled={isPending} onClick={handleConfirm}>
            {isPending ? "Approving…" : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
