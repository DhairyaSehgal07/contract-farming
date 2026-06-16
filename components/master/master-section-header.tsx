"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type MasterSectionHeaderProps = {
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
  actionHref?: string;
  actionDisabled?: boolean;
};

export function MasterSectionHeader({
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  actionDisabled = false,
}: MasterSectionHeaderProps) {
  const showAction = Boolean(onAction || actionHref);
  const isDisabled = actionDisabled || !showAction;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-medium">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {actionHref ? (
        <Button asChild disabled={isDisabled}>
          <Link href={actionHref}>
            <Plus />
            {actionLabel}
          </Link>
        </Button>
      ) : (
        <Button onClick={onAction} disabled={isDisabled}>
          <Plus />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
