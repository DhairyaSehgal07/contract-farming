"use client";

import type { ComponentProps } from "react";
import { ActionButton } from "@/components/auth/action-button";

type BetterAuthActionButtonProps = Omit<
  ComponentProps<typeof ActionButton>,
  "action"
> & {
  action: () => Promise<{ data?: unknown; error: null | { message?: string } }>;
  successMessage?: string;
};

export function BetterAuthActionButton({
  action,
  successMessage,
  ...props
}: BetterAuthActionButtonProps) {
  return (
    <ActionButton
      {...props}
      action={async () => {
        const res = await action();
        if (res.error) {
          return {
            error: true,
            message: res.error.message ?? "Action failed",
          };
        }
        return { error: false, message: successMessage };
      }}
    />
  );
}
