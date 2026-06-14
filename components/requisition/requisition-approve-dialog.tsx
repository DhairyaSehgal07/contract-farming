"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type RequisitionApproveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmerName: string;
  onConfirm: () => void;
  isPending?: boolean;
};

export function RequisitionApproveDialog({
  open,
  onOpenChange,
  farmerName,
  onConfirm,
  isPending = false,
}: RequisitionApproveDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve requisition</AlertDialogTitle>
          <AlertDialogDescription>
            Approve the requisition for &ldquo;{farmerName}&rdquo;? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {isPending ? "Approving…" : "Approve"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
