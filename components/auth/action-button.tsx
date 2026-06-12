"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition, type ComponentProps } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type ActionResult = { error: boolean; message?: string };

type ActionButtonProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  action: () => Promise<ActionResult>;
  onSuccess?: () => void;
  requireAreYouSure?: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
};

export function ActionButton({
  action,
  onSuccess,
  requireAreYouSure = false,
  confirmTitle = "Are you sure?",
  confirmDescription = "This action cannot be undone.",
  children,
  disabled,
  ...props
}: ActionButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function runAction() {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        toast.error(result.message ?? "Action failed");
        return;
      }

      if (result.message) {
        toast.success(result.message);
      }

      onSuccess?.();
      setOpen(false);
    });
  }

  const button = (
    <Button
      {...props}
      disabled={disabled || isPending}
      onClick={requireAreYouSure ? undefined : runAction}
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : children}
    </Button>
  );

  if (!requireAreYouSure) {
    return button;
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={runAction} disabled={isPending}>
            {isPending ? "Working…" : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
