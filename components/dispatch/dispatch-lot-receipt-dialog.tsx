"use client";

import { useEffect, useState } from "react";
import type { DispatchLotRow } from "@/app/actions/dispatch/dispatches";
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
import { Input } from "@/components/ui/input";
import {
  useConfirmLotReceipt,
  useSendLotReceiptOtp,
} from "@/hooks/dispatch/use-dispatches";

type DispatchLotReceiptDialogProps = {
  dispatchId: string;
  lot: DispatchLotRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DispatchLotReceiptDialog({
  dispatchId,
  lot,
  open,
  onOpenChange,
}: DispatchLotReceiptDialogProps) {
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOtpMutation = useSendLotReceiptOtp();
  const confirmMutation = useConfirmLotReceipt(dispatchId);

  useEffect(() => {
    if (!open) {
      setOtp("");
      setDevOtp(null);
      setOtpSent(false);
      setError(null);
    }
  }, [open]);

  if (!lot) {
    return null;
  }

  const activeLot = lot;

  function handleSendOtp() {
    setError(null);
    sendOtpMutation.mutate(
      { lotId: activeLot.id },
      {
        onSuccess: (data) => {
          setOtpSent(true);
          setDevOtp(data.devOtp ?? null);
        },
      },
    );
  }

  function handleConfirm() {
    const trimmed = otp.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setError("Enter a valid 6-digit OTP.");
      return;
    }

    setError(null);
    confirmMutation.mutate(
      { lotId: activeLot.id, otp: trimmed },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  }

  const isPending = sendOtpMutation.isPending || confirmMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm farmer receipt</DialogTitle>
          <DialogDescription>
            Send an OTP to {activeLot.farmer.name} at {activeLot.farmer.mobileNumber}, then
            enter the code shared by the farmer to confirm receipt of{" "}
            {activeLot.totalQuantity} bags.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          {devOtp ? (
            <div className="rounded-md border border-dashed p-3 text-sm">
              <p className="font-medium">Simulated OTP</p>
              <p className="text-muted-foreground">
                SMS is not sent yet — use this code to confirm receipt:{" "}
                <span className="font-mono text-foreground">{devOtp}</span>
              </p>
            </div>
          ) : null}

          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="lot-receipt-otp">OTP</FieldLabel>
            <Input
              id="lot-receipt-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="6-digit OTP"
              value={otp}
              disabled={!otpSent || isPending}
              aria-invalid={error ? true : undefined}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
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
          {!otpSent ? (
            <Button
              type="button"
              disabled={isPending}
              onClick={handleSendOtp}
            >
              {sendOtpMutation.isPending ? "Sending…" : "Send OTP"}
            </Button>
          ) : (
            <Button type="button" disabled={isPending} onClick={handleConfirm}>
              {confirmMutation.isPending ? "Confirming…" : "Confirm receipt"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
