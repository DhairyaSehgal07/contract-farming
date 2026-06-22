"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

type RequisitionRemarksDisplayProps = {
  remarks: string | null | undefined;
  variant?: "table" | "detail" | "inline";
  className?: string;
};

function remarksClassName(
  variant: NonNullable<RequisitionRemarksDisplayProps["variant"]>,
  className?: string,
) {
  const isTruncated = variant === "table" || variant === "inline";

  return cn(
    "italic text-foreground",
    "rounded-md border border-border/70 bg-accent/35 px-2.5 py-1 text-sm shadow-xs",
    "border-l-2 border-l-primary/40",
    "cursor-default transition-opacity hover:opacity-90",
    isTruncated && "block max-w-48 truncate",
    variant === "detail" && "inline-block leading-relaxed",
    className,
  );
}

export function RequisitionRemarksDisplay({
  remarks,
  variant = "table",
  className,
}: RequisitionRemarksDisplayProps) {
  const trimmed = remarks?.trim();

  if (!trimmed) {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>—</span>
    );
  }

  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span className={remarksClassName(variant, className)}>{trimmed}</span>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-auto max-w-sm">
        <p className="text-xs text-muted-foreground">Remarks</p>
        <p className="mt-1 italic leading-relaxed text-foreground">{trimmed}</p>
      </HoverCardContent>
    </HoverCard>
  );
}
