"use client";

import type { LucideIcon } from "lucide-react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type VerticalStepperStep = {
  title: string;
  description?: string;
  icon: LucideIcon;
  status: "complete" | "active" | "upcoming" | "failed" | "skipped";
};

type VerticalStepperProps = {
  steps: VerticalStepperStep[];
  "aria-label"?: string;
};

function StepIcon({
  step,
}: {
  step: VerticalStepperStep;
}) {
  const Icon = step.icon;

  if (step.status === "complete") {
    return <Check className="size-4" aria-hidden />;
  }

  if (step.status === "failed") {
    return <X className="size-4" aria-hidden />;
  }

  return <Icon className="size-4" aria-hidden />;
}

function circleClassName(status: VerticalStepperStep["status"]) {
  switch (status) {
    case "complete":
      return "bg-primary text-primary-foreground";
    case "active":
      return "bg-primary/15 text-primary ring-2 ring-primary";
    case "failed":
      return "bg-destructive/15 text-destructive";
    case "skipped":
      return "bg-muted/50 text-muted-foreground/50";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function titleClassName(status: VerticalStepperStep["status"]) {
  switch (status) {
    case "complete":
    case "active":
      return "text-foreground font-medium";
    case "failed":
      return "text-destructive font-medium";
    case "skipped":
      return "text-muted-foreground/50";
    default:
      return "text-muted-foreground";
  }
}

function descriptionClassName(status: VerticalStepperStep["status"]) {
  switch (status) {
    case "skipped":
      return "text-muted-foreground/50";
    case "failed":
      return "text-destructive/80";
    default:
      return "text-muted-foreground";
  }
}

function connectorClassName(status: VerticalStepperStep["status"]) {
  return status === "complete" ? "bg-primary" : "bg-border";
}

export function VerticalStepper({
  steps,
  "aria-label": ariaLabel = "Progress",
}: VerticalStepperProps) {
  return (
    <nav aria-label={ariaLabel} className="w-full">
      <ol className="flex flex-col">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;

          return (
            <li key={step.title} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    circleClassName(step.status),
                  )}
                  aria-current={step.status === "active" ? "step" : undefined}
                >
                  <StepIcon step={step} />
                </div>
                {!isLast ? (
                  <div
                    className={cn(
                      "my-1 w-px flex-1 min-h-8",
                      connectorClassName(step.status),
                    )}
                    aria-hidden
                  />
                ) : null}
              </div>

              <div className={cn("flex flex-col gap-0.5 pb-8", isLast && "pb-0")}>
                <span className={cn("text-sm", titleClassName(step.status))}>
                  {step.title}
                </span>
                {step.description ? (
                  <span
                    className={cn(
                      "text-sm",
                      descriptionClassName(step.status),
                    )}
                  >
                    {step.description}
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
