"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

type RequisitionRejectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmerName: string;
  onConfirm: (rejectionRemarks: string) => void;
  isPending?: boolean;
};

export function RequisitionRejectDialog({
  open,
  onOpenChange,
  farmerName,
  onConfirm,
  isPending = false,
}: RequisitionRejectDialogProps) {
  const [rejectionRemarks, setRejectionRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setRejectionRemarks("");
      setError(null);
    }
  }, [open]);

  function handleConfirm() {
    const trimmed = rejectionRemarks.trim();
    if (trimmed.length < 3) {
      setError("Rejection remarks must be at least 3 characters.");
      return;
    }

    setError(null);
    onConfirm(trimmed);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject requisition</DialogTitle>
          <DialogDescription>
            Reject the requisition for &ldquo;{farmerName}&rdquo;. Provide a
            reason for the rejection.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="rejection-remarks">
              Rejection remarks
            </FieldLabel>
            <Textarea
              id="rejection-remarks"
              value={rejectionRemarks}
              onChange={(event) => {
                setRejectionRemarks(event.target.value);
                if (error) setError(null);
              }}
              placeholder="Explain why this requisition is being rejected"
              rows={4}
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
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending ? "Rejecting…" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
