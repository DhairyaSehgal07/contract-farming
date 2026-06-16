"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Select Requisitions",
    description: "Choose approved requisitions",
  },
  {
    title: "Fill Details",
    description: "Enter dispatch and truck details",
  },
] as const;

type DispatchFormStepperProps = {
  currentStep: 1 | 2;
};

export function DispatchFormStepper({ currentStep }: DispatchFormStepperProps) {
  return (
    <nav aria-label="Dispatch form progress" className="w-full">
      <ol className="flex items-start">
        {STEPS.map((step, index) => {
          const stepNumber = (index + 1) as 1 | 2;
          const isActive = currentStep === stepNumber;
          const isComplete = currentStep > stepNumber;
          const isLast = index === STEPS.length - 1;

          return (
            <li
              key={step.title}
              className={cn("flex items-start", !isLast && "flex-1")}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                    isComplete || isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isComplete ? <Check className="size-4" /> : stepNumber}
                </div>
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isActive || isComplete
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {step.description}
                  </span>
                </div>
              </div>
              {!isLast ? (
                <div
                  className={cn(
                    "mx-4 mt-4 h-px flex-1",
                    isComplete ? "bg-primary" : "bg-border",
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
