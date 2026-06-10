"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type MasterSectionHeaderProps = {
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
  actionDisabled?: boolean;
};

export function MasterSectionHeader({
  title,
  description,
  actionLabel,
  onAction,
  actionDisabled = false,
}: MasterSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-medium">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Button onClick={onAction} disabled={actionDisabled || !onAction}>
        <Plus />
        {actionLabel}
      </Button>
    </div>
  );
}
